
const PORTS = ['8080', '8080'];
const HOSTS = ['localhost', '127.0.0.1', '127.19.0.2'];



const tryConn = async (h, p) => {
    try {    
        const res = await fetch(`http://${h}:${p}/`);
        console.log(h, p);
        if (res.ok) {
            // setPort(p);
            // setHost(h);
            console.log(p);
            console.log(h);
            console.log(await res.json());
        }
    } catch (e) {
        console.error(e);
    }
}


for (let i = 0; i < PORTS.length; i++) {
        for (let j = 0; j < HOSTS.length; j++) {
            await tryConn(HOSTS[j], PORTS[i]);
        }
    }