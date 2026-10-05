import string


ALPHABET = (
    string.digits
    + string.ascii_lowercase
    + string.ascii_uppercase
)

BASE = len(ALPHABET)


def encode(number: int) -> str:
    if number < 0:
        raise ValueError(
            "Number cannot be negative"
        )

    if number == 0:
        return ALPHABET[0]

    result = []

    while number:
        number, remainder = divmod(
            number,
            BASE,
        )

        result.append(
            ALPHABET[remainder]
        )

    return "".join(
        reversed(result)
    )


def decode(value: str) -> int:
    if not value:
        raise ValueError(
            "Value cannot be empty"
        )

    number = 0

    for character in value:
        try:
            index = ALPHABET.index(
                character
            )

        except ValueError as exc:
            raise ValueError(
                f"Invalid Base62 character: "
                f"{character}"
            ) from exc

        number = (
            number * BASE
            + index
        )

    return number