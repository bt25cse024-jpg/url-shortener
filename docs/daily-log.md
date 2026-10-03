## Day 1 - 16 Sep 2026

### How do i make short links :

**what is base64 and base62 :** 
Binary-to-text or number-to-text encoding system that convert data to readable ASCII string.
>* **Base64 :** Uses 64 characters (0-9, a-z, A-Z, +, /) for encoding.
>* **Base62 :** Uses 62 characters (0-9, a-z, A-Z) for encoding.

since we dont need "+" and "/" we can use base62 we will take an incrementer, which increment whenever we generate a link and encode it using base62 to generate a short link.  
**How to make sure two link never get same short link :**
since we will be using database, we can use unique key or primary key to store the short link It will ensure now two links are same.    

**what to do when user type unknown short link?**
It should simply tell browser, then website is not found or exits. the original url not found for the given short url and return 404.

**If one short link suddenly gets thousands of visits, what part of the system might struggle, and why?**
repeated lookups can overload the database, especially when many requests arrive at once. It’s less about storing lots of new data and more about handling many reads quickly.


## Day 2 - 17 Sep 2026

### Database :

**Which Database ?**
PostgreSQL, On day 2, I learned about postgres and how to use it, how i make database, tables, alter table, add rows, constraints and many more thing, i have just done the basics and minimal things. later i will learn thing as i go through the project.

### Cache memory:

**What cache memory will do?**
Api first approch cache memory, we will use redis for cache memory, if cache hit, then it will git origianl url from cache, else if cache miss or redis is unavailabe, api will fetch original url from database, if cache miss then the retrived data will be saved in cache memory for further use.

for each data value, there is 24 hour TTL, which is optimal for our current project, too short TTL will more frequently require to fetch data from database, which is a hessale and too long TTL the cache memory could get fully filled and if the url is updated, it would not get updated in the cache, and need to wait till TTL.

## Day 3 - 18 Sep 2026

### Database Schema :

first of all, we will be creating url shortener for a large random url, so how much space will we need.

>let's say we use base62 encoding and the length of short link is 7 then we can have 62^7 = 3,521,616,963,62,176 short links.
>
>let's say there is 1000 links shorted per second, then time to fill the database will be, 
>
>* 3,521,616,963,621.76 / 1000 = 3,521,616,963.62176 seconds.
>* 3,521,616,963.62176 / 60 = 58,693,616.06036267 minutes.
>* 58,693,616.06036267 / 60 = 978,226.9343393778 hours.
>* 978,226.9343393778 / 24 = 40,759.45559747407 days.
>* 40,759.45559747407 / 365.25 = 111.59 years.
>
>which will be enough for this project :)