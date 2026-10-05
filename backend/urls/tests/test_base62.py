import pytest

from urls.services.base62 import (
    decode,
    encode,
)


@pytest.mark.parametrize(
    "number",
    [
        0,
        1,
        61,
        62,
        125,
        1000,
        999999,
    ],
)
def test_base62_round_trip(number):
    encoded = encode(number)

    assert decode(encoded) == number


def test_negative_number():
    with pytest.raises(ValueError):
        encode(-1)


def test_empty_value():
    with pytest.raises(ValueError):
        decode("")