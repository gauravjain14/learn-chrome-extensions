import os
from collections import OrderedDict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
import openai
import chromadb.utils.embedding_functions as embedding_functions


# Initialize OpenAI for embeddings
openai.api_key = os.environ['OPENAI_API_KEY']
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=openai.api_key,
        model_name="text-embedding-3-small"
    )

# Initialize ChromaDB client
client = chromadb.PersistentClient(f"{os.getcwd()}/post_embeddings/")
collection = client.get_or_create_collection(
    name="linkedin_posts", 
    embedding_function=openai_ef
)

# Create FastAPI app
app = FastAPI()

class Post(BaseModel):
    content: str
    metadata: dict

@app.post("/save_post")
async def save_post(post: Post):
    try:
        collection.add(
            ids=[post.metadata["id"]],
            documents=[post.content],
            metadatas=[post.metadata]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Request schema
class QueryRequest(BaseModel):
    query_text: str
    n_results: int = 5
    filters: dict = None

# Define the API endpoint
@app.post("/search")
async def search(query: QueryRequest):
    try:
        # Perform the query
        results = collection.query(
            query_texts=[query.query_text],
            n_results=query.n_results,
            where=query.filters  # Apply metadata filters if provided
        )

        filtered_results = []
        # Iterate over the first list in each key since they are nested
        for i, distance in enumerate(results['distances'][0]):
            if distance < 1:
                entry = {
                    'id': results['ids'][0][i],
                    'distance': distance,
                    'author': results['metadatas'][0][i]['author'],
                    'url': results['metadatas'][0][i]['url'],
                    'document': results['documents'][0][i]
                }
                filtered_results.append(entry)

        # Only return results with distances < 1. Otherwise as the user to
        # refine the search query.
        return filtered_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

