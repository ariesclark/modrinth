import modrinth from "../lib/src/index";

test("user", () => {
    modrinth.user("suMONnLn").then((user) => {
        expect(user.id).toBe("suMONnLn");
    })
});