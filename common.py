from chromadb.api.types import Embedding, Document, Image, URI
from pydantic.dataclasses import dataclass
from pydantic import ConfigDict, Field, BaseModel

class Metadata(BaseModel):
    path: str
    projection_x: None|float = None
    projection_y: None|float = None

@dataclass(config=ConfigDict(arbitrary_types_allowed=True))
class Registro:
    id: str
    embedding: Embedding = Field(repr=False)
    metadata: Metadata = Field(repr=True)
    document: Document = Field(repr=True)
    image: None|Image = None
    uri: None|URI = None