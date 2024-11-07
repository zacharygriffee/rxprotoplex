import {test} from "brittle";
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
    onConnectionAndRead$
} from "./index.js";
import b4a from "b4a";
import {from, take} from "rxjs";

test("test connection$", async t => {
    t.plan(1);
    const [p1, p2] = createPlexPair();
    p1.listen();
    onConnectionAndRead$(p1).pipe(take(1)).subscribe(
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