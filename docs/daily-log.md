## Day 1 - 16 Sep 2026

**How do i make short links :** 
    **what is base64 and base62 :** Binary-to-text or number-to-text encoding system that convert data to readable ASCII string.
        **Base64 :** Uses 64 characters (0-9, a-z, A-Z, +, /) for encoding.
        **Base62 :** Uses 62 characters (0-9, a-z, A-Z) for encoding.

    since we dont need "+" and "/" we can use base62.
    we will take an incrementer, which increment whenever we generate a link.
    and encode it using base62 to generate a short link.  

**How to make sure two link never get same short link :**
    since we will be using database, we can use unique key or primary key to store the short link.
    It will ensure now two links are same.


    