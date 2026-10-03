BASE62_CHAR = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def base62_encode(num):
    if num == 0:
        return BASE62_CHAR[0]
    b62 = ""
    while num > 0:
        num, rem = divmod(num, 62)
        b62 = BASE62_CHAR[rem] + b62
    return b62
