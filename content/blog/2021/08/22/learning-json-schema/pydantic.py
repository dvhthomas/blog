from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from pydantic.types import conint, conlist, conset, constr
from pydantic.color import Color


def snake_to_camel(field_name: str) -> str:
    """
    Turns a snake-cases string like 'my_variable_name'
    into a camel cased 'myVariableName' which is more suitable
    for a JS API.
    """
    first, *the_rest = field_name.split("_")
    return "".join([first.lower(), *map(str.title, the_rest)])


class SketchBase(BaseModel):
    """
    All models need to have camelCaseProperties so they inherit
    this class.
    """

    class Config:
        alias_generator = snake_to_camel


class FeatureFlag(str, Enum):
    """
    Feature flags are used to determine whether a feature of the sketch app that was used to create sketch data was enabled.
    """

    enabled = "enabled"
    disabled = "disabled"


class PageCoordinate(SketchBase):
    """
    A location in page units rather than real world coordinates.
    The origin for page coordinates is the upper left corner of the page, so `0,0` is the top left corner.
    There are no units for `pageCoordinates`, they are simple integers that increase from left-to-right and from top-to-bottom.
    """

    x: conint(ge=0)
    y: conint(ge=0)


class RelativeCoordinate(SketchBase):
    """
    A location in relative units rather than real world or Page coordinates. Relative coordinates measure right and up from the origin. So the first number is for right and second is for up.
    """

    right: conint(ge=0)
    up: conint(ge=0)


class Note(SketchBase):
    """
    A note is a piece of text anchored to a specific page.
    """

    keycode: constr(min_length=1) = ...
    text: constr(min_length=1, max_length=255) = ...
    page_number: conint(ge=1) = 1
    note_position: PageCoordinate = ...

    class Config:
        schema_extra = {
            "examples": [
                {
                    "keyCode": "1/0",
                    "text": "Main Condo Strip",
                    "notePosition": "49,44",
                    "pageNumber": 1,
                },
            ]
        }
