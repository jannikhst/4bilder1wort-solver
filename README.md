# 4 Bilder 1 Wort Solver

A small side project to solve *4 Bilder 1 Wort* "Ask a Friend" links. If you’re not familiar, *4 Bilder 1 Wort* (4 Pics 1 Word) is a popular word puzzle game where players guess a word based on four pictures. When players get stuck, they can share a link asking friends for help. Try the solver [here](https://4bilder1wort.jannik.club).

This project reverse-engineers the game’s client to figure out how the signature and secret key are generated. It extracts the puzzle details from the shared link, generates the required HMAC-SHA256 signature, and makes a request to fetch the solution.

### What It Does

- Parses the "Ask a Friend" link to extract puzzle information.
- Generates the necessary HMAC-SHA256 signature using the secret key.
- Sends an authenticated request to retrieve the solution for the puzzle.

### Why?

Built in a couple of hours for fun and as a challenge to understand how the game handles its requests. This is purely for educational purposes and not affiliated with the creators of *4 Bilder 1 Wort*.
