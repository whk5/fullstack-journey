async function main() {
    // Like the browser fetch API, the default method is GET
    const response = await fetch('https://api.github.com/users/nodejs/repos', {
        method: 'GET',
        headers: {
            'User-Agent': 'undici-stream-example',
            Accept: 'application/json',
        },
    });
    const data = await response.json();
    console.log(
        'Repository Names:',
        data.map((repo: { name: string }) => repo.name)
    );
    // returns something like:
    //   {
    //   userId: 1,
    //   id: 1,
    //   title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    //   body: 'quia et suscipit\n' +
    //     'suscipit recusandae consequuntur expedita et cum\n' +
    //     'reprehenderit molestiae ut ut quas totam\n' +
    //     'nostrum rerum est autem sunt rem eveniet architecto'
    // }
}
main().catch(console.error);