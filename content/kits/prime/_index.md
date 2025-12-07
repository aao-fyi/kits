---
title: Prime
description: Prime number utility.
icon: hash
weight: 30
draft: false
---

## Details
Prime number checks are accomplished with 20 iterations of the [Miller-Rabin primality test](https://wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test). Next prime checks utilize [6k&plusmn;1 wheel factorization](https://wikipedia.org/wiki/Primality_test#Simple_methods) to identify candidates. Random numbers for prime checks are generated with the [Rando.js library](https://github.com/nastyox/Rando.js).
