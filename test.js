import {test, solo, skip} from "brittle";
import {
    listenAndConnectionAndRead$,
    createPlexPair,
    connectAndRead$,
    withEncoding,
    withPlex,
    withHandshake,
    listenAndConnection$,
    connectAndSend,
    tapSend,
    connection$, close$, connectionAndRead$, connect$, asPlex, destroy
} from "./index.js";
import b4a from "b4a";
import {from, take} from "rxjs";
import {withTimeout} from "./lib/withTimeout.js";
import {Duplex} from "streamx";
import {catchError} from "rxjs/operators";
// Utility function for delayed closure
const delayedClose = (closure$, delay, value) => {
    setTimeout(() => {
        closure$.next(value);
    }, delay);
};

test("destroy function with error", async (t) => {
    t.plan(2);

    // Create a Plex instance using Duplex (or your specific implementation)
    const plex = asPlex(new Duplex());

    // Subscribe to the close$ observable
    const subscription = close$(plex).subscribe({
        next(e) {
            t.is(e.message, "fun", 'Next message for close$ should be an error for "fun"');
        },
        error(e) {
            t.is(e.message, "fun", 'Error message should match "fun"');
        },
        complete() {
            t.fail('Should not complete when destroy is called with error');
        },
    });

    // Call destroy with an error to trigger the 'error' event
    destroy(plex, new Error("fun"));

    // Cleanup after test to prevent memory leaks
    subscription.unsubscribe();
});

test("destroy function without error", async (t) => {
    t.plan(2);

    // Create a Plex instance using Duplex (or your specific implementation)
    const plex = asPlex(new Duplex());

    // Subscribe to the close$ observable
    const subscription = close$(plex).subscribe({
        next(value) {
            t.absent(value, 'Should receive next when destroy is called without error and the value is undefined');
        },
        error(e) {
            t.fail('Error should not occur');
        },
        complete() {
            t.pass('Should not complete when destroy is called with error');
        },
    });

    // Call destroy with an error to trigger the 'error' event
    destroy(plex);

    // Cleanup after test to prevent memory leaks
    subscription.unsubscribe();
});

skip("close$ emits when stream destroys", t => {
    t.plan(1)
   const plex = asPlex(new Duplex());

   plex.close$.subscribe(() => {
       t.pass();
   });

   destroy(plex);
});

test("test connection$", async t => {
    t.plan(1);
    const [p1, p2] = createPlexPair();
    p1.listen();
    connectionAndRead$(p1).pipe(take(1)).subscribe(
        ({data}) => t.is(b4a.toString(data), "hello")
    );

    p2.connect().end(b4a.from("hello"));
});

test("has isProtoplex", t => {
    const [p1,p2] = createPlexPair()
    t.is(p1.isProtoplex && p2.isProtoplex, true);
    const socket = p1.connect();
    t.absent(socket.isProtoplex);
    t.absent(p1.mux.stream.isProtoplex);
    socket.destroy();
})

test("test listenAndConnect$", async t => {
    t.plan(1);
    const [p1, p2] = createPlexPair();
    listenAndConnectionAndRead$(p1).pipe(take(1)).subscribe(
        ({data}) => t.is(b4a.toString(data), "hello")
    );
    p2.connect().end(b4a.from("hello"));
});

test("test connectAndSend and withPlex with encoding", async t => {
    t.plan(1);
    const [p1, p2] = createPlexPair();
    let sender;
    withPlex(p2, () => {
        sender = connectAndSend({encoding: "utf8"});

        withPlex(p1, () => {
            listenAndConnectionAndRead$({encoding: "utf8"}).pipe(take(1)).subscribe(
                ({data}) => {
                    t.is(data, "hello");
                }
            )
        });
    });

    sender("hello")
});

test("withHandshake and withEncoding succeeds", async t => {
    t.plan(1);
    const [p1, p2] = createPlexPair();
    const config = withEncoding("utf8")
    const serverConfig = withHandshake({
        handshakeEncoding: "utf8",
        handshake: "bob",
        onhandshake: (o) => o === "alice"
    }, config);
    const clientConfig = withHandshake({
        handshakeEncoding: "utf8",
        handshake: "alice",
        onhandshake: (o) => o === "bob"
    }, config);


    listenAndConnectionAndRead$(p1, serverConfig).pipe(take(1)).subscribe(
        ({data}) => {
            t.is(data, "hello");
        }
    );

    const sender2 = connectAndSend(p2, clientConfig);
    sender2("hello");
});

test("withHandshake and withEncoding rejection", async t => {
    t.plan(1);
    const [p1, p2] = createPlexPair();
    const config = withEncoding("utf8")
    const serverConfig = withHandshake({
        handshakeEncoding: "utf8",
        handshake: "bob",
        onhandshake: (o) => o === "alice"
    }, config);
    const clientConfig = withHandshake({
        handshakeEncoding: "utf8",
        handshake: "wonderland",
        onhandshake: (o) => o === "bob"
    }, config);


    listenAndConnectionAndRead$(p1, serverConfig).pipe(take(1)).subscribe(
        {
            next: () => {
                t.fail("Rejected in handshake so this shouldn't happen.");
            },
            error: (e) => {
                t.is(e.message, "Connection Rejected!", "Connection should be rejected.");
            }
        }
    );

    connectAndSend(p2, clientConfig)("won't happen");
});

test("tapSend and withEncoding", async t => {
    t.plan(2);
    const serverTest = t.test("server");
    serverTest.plan(3);
    const [p1, p2] = createPlexPair();

    const original = ["hello", "world", "!"];
    const serverResult = [];
    const clientResult = [];
    listenAndConnectionAndRead$(p1, withEncoding("utf8"))
        .subscribe(({data}) => {
                const orig = original.shift();
                serverResult.push(orig)
                serverTest.is(data, orig);
            }
        );

    from(original).pipe(tapSend(p2, withEncoding("utf8")))
        .subscribe((data) => {
            clientResult.push(data);
        });
    await serverTest;
    t.alike(serverResult, clientResult);
});

test("connect and read", async t => {
    t.plan(3);
    const [p1, p2] = createPlexPair();

    withPlex(p1, () => {
        listenAndConnection$(withEncoding("json")).subscribe(
            stream => {
                stream.write({hello: "world"});
                stream.write("no worries");
                stream.write({hello: "world"});
            }
        );
    });

    withPlex(p2, () => {
        connectAndRead$(withEncoding("json")).subscribe(
            ({data: o}) => {
                if (typeof o === "object") t.alike(o, {hello: "world"});
                else t.is(o, "no worries");
            });
    });
});



test("should establish multiple connections and exchange messages", async t => {
    t.plan(2); // Expect two successful assertions
    const [p1, p2] = createPlexPair();

    const conn$ = listenAndConnection$(p1, "channelId");

    conn$.subscribe({
        next: connection => {
            connection.on("data", data => {
                t.is(b4a.toString(data), "test message", "Message delivered successfully");
            });
        },
        error: () => t.fail("Error should not occur during connection"),
        complete: () => t.fail("Complete should not be called in this test")
    });

    // Establish a connection from p2 and send a message
    connect$(p2, "channelId").subscribe(stream => {
        stream.end(b4a.from("test message"));
        t.pass("Connection successfully established from p2");
    });
});

test("should handle connection error for non-existent channel", async t => {
    t.plan(1); // Expect one assertion
    const [p1, p2] = createPlexPair();


    // Wrap the connect$ observable with a timeout
    const timeoutDuration = 1000; // Set timeout to 1000 ms for test

    withTimeout(connect$(p1, "nonExistentChannel"), timeoutDuration).subscribe({
        next: () => t.fail("Next should not be called for non-existent channel"),
        error: (err) => {
            t.ok(err, "Error caught successfully when connecting to a non-existent channel");
        },
        complete: () => t.fail("Complete should not be called for non-existent channel")
    });
});

test("connection$ closes properly on close$ with error", async t => {
    t.plan(3);
    const [p1, p2] = createPlexPair();

    const conn$ = listenAndConnection$(p1, "channelId");
    const closure$ = close$(p1);

    p1.close$.subscribe({error: e => t.is(e.message, "Error!!!!")});
    p2.close$.subscribe({error: e => t.is(e.message, "Error!!!!")});

    conn$.subscribe({
        next: connection => {
            t.ok(connection, "Connection established successfully");
        }
    });

    connect$(p2, "channelId").subscribe({
        next: stream => {
            stream.end(b4a.from("test message"));
        }
    });

    setTimeout(() => {
        // Non graceful close.... error
        closure$.next(new Error("Error!!!!"));
    });
});

test("connection$ closes properly on close$ gracefully", async t => {
    t.plan(3);
    const [p1, p2] = createPlexPair();

    const conn$ = listenAndConnection$(p1, "channelId");
    const closure$ = close$(p1);

    p1.close$.subscribe(t.absent);
    p2.close$.subscribe(t.absent);

    conn$.subscribe({
        next: connection => {
            t.ok(connection, "Connection established successfully");
        }
    });

    connect$(p2, "channelId").subscribe({
        next: stream => {
            stream.end(b4a.from("test message"));
        }
    });

    setTimeout(() => {
        // graceful close without error.
        closure$.next();
    });
});


test("should gracefully shutdown on close$ while messages are exchanged", async t => {
    t.plan(2);
    const [p1, p2] = createPlexPair();

    const conn$ = listenAndConnection$(p1, "channelId");
    const closure$ = close$(p1);

    conn$.subscribe({
        next: connection => {
            connection.on("data", data => {
                t.is(b4a.toString(data), "test message", "Message delivered successfully");
            });
        },
        complete: () => {
            t.pass("Connection closed gracefully");
        },
        error: (err) => {
            t.fail("Unexpected error during graceful shutdown: " + err.message);
        }
    });

    // Establish connection and send messages
    connect$(p2, "channelId").subscribe({
        next: stream => {
            stream.write(b4a.from("test message"));
        }
    });

    // Emit close$ without an error after a delay to simulate graceful shutdown
    setTimeout(() => {
        closure$.next(); // Trigger closure without an error
    }, 100);
});

// TODO: trace where the data is left open.
// solo("should gracefully clean up resources and event listeners after close$", async t => {
//     t.plan(1);
//     const [p1] = createPlexPair();
//
//     const conn$ = listenAndConnection$(p1, "channelId");
//     const closure$ = close$(p1);
//
//     conn$.subscribe({
//         complete: () => {
//             // Check for any lingering event listeners after connection closure
//             setTimeout(() => {
//                 const listeners = p1.mux.stream.listenerCount("data");
//                 if (listeners === 0) {
//                     t.pass("All resources cleaned up successfully");
//                 } else {
//                     t.fail(`Unexpected lingering listeners detected: ${listeners}`);
//                 }
//             },1000);
//         },
//         error: (err) => t.fail("Unexpected error during resource cleanup: " + err.message)
//     });
//
//     // Trigger graceful closure after a delay to simulate graceful shutdown
//     setTimeout(() => {
//         closure$.next(); // Trigger closure without an error (graceful shutdown)
//     }, 2000);
// });
