const Client = require("./aminojs/client").Client;
const SubClient = require("./aminojs/sub_client").SubClient;
const input = require('prompt-sync')();

async function choose_from_sub_clients(client, debug = false) {
    let subClients = (await client.sub_clients())["communityList"];
    for (let i = 0; i < subClients.length; i++)
        console.log(`${i+1}.${subClients[i]["name"]}`);
    let ch = Number(input(">")) - 1;
    if (debug) console.log(`${subClients[ch]["name"]}=${subClients[ch]["ndcId"]}`);
    return subClients[ch]["ndcId"];
}

async function choose_from_chat_threads(client, debug = false) {
    let threads = (await client.get_chat_threads())["threadList"];
    for (let i = 0; i < threads.length; i++)
        console.log(`${i+1}.${threads[i]["title"]}`);
    let ch = Number(input(">")) - 1;
    if (debug) console.log(`${threads[ch]["title"]}=${threads[ch]["threadId"]}`);
    return threads[ch]["threadId"];
}

async function choose_from_chat_messages(client, threadId, pageToken = null, start = 0, debug = false) {
    let data = (await client.get_chat_messages(threadId, undefined, pageToken));
    let messages = data['messageList'];
    for (let i = 0; i < messages.length; i++)
        console.log(`${25*start+i+1}:${i+1}.${String(messages[i]["author"]["nickname"]).slice(0,20)}.${String(messages[i]["content"]).slice(0,10)}.${messages[i]["type"]}`);
    if (debug) {
        let ch = (Number(input(">")) - 1) % 25;
        console.log(messages[ch]);
    }
    return data;
}

const main = async function() {
    let client,
        subClient,
        email,
        password,
        threadId,
        data,
        r;
    client = new Client();
    email = input("email/phone number: ");
    password = input("password: ")
    if (email.includes("+")) await client.login_phone(email, password);
    else await client.login(email, password);
    console.log("Logined successfully.");
    console.log(`Choose from community:\n1-yes\n2-no`);
    if (Number(input(">")) == 1) subClient = new SubClient(client = client, ndcId = await choose_from_sub_clients(client));
    threadId = await choose_from_chat_threads(subClient ?? client);
    r = Number(input("Start(*25)>"));
    for (let i = 0; i < r; i++)
        data = (await choose_from_chat_messages(subClient ?? client, threadId, data ? data.paging.nextPageToken : undefined, i ? i : undefined, i == r - 1 ? true : false));
    input();
}
main();