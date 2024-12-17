import logging
import os
import shutil
from collections import OrderedDict
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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
embeddings_persistent_path = f"{os.getcwd()}/post_embeddings/"
client = chromadb.PersistentClient(embeddings_persistent_path)
collection = client.get_or_create_collection(
    name="linkedin_posts", 
    embedding_function=openai_ef
)

app = FastAPI()

origins = [
     "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://ajjhagecjjeghinaejhnlohjonnnjiii"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class Post(BaseModel):
    content: str
    metadata: dict

@app.post("/save_post")
async def save_post(post: Post):
    try:
        collection = client.get_or_create_collection(
            name="linkedin_posts", 
            embedding_function=openai_ef
        )
        collection.add(
            ids=[post.metadata["id"]],
            documents=[post.content],
            metadatas=[post.metadata]
        )
    except Exception as e:
        logging.error(f"Error: {str(e)}")
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
            # How to select this distance? For now, 
            if distance < 1:
                entry = {
                    'id': results['ids'][0][i],
                    'distance': distance,
                    'author': results['metadatas'][0][i]['author'],
                    'url': results['metadatas'][0][i]['url'],
                    'document': results['documents'][0][i]
                }
                filtered_results.append(entry)

            # Always display at 
            if not filtered_results:
                filtered_results.append({
                    'id': results['ids'][0][0],
                    'distance': distance,
                    'author': results['metadatas'][0][0]['author'],
                    'url': results['metadatas'][0][0]['url'],
                    'document': results['documents'][0][0]
                })

        # Only return results with distances < 1. Otherwise as the user to
        # refine the search query.
        return filtered_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/clear-chroma-db')
def clear_chroma_db(request: Request):
    try:
        collection_name = "linkedin_posts"
        client.delete_collection(collection_name)
        # Also clear the persistent embeddings - Seeing errors here. Disable for now.
        # clear_persistent_embeddings()
        return JSONResponse(
            content={"success": True, "message": "ChromaDB collection cleared."},
            status_code=200
        )
    except Exception as e:
        return JSONResponse(
            content={"success": False, "message": f"Error: {str(e)}"},
            status_code=500
        )

def clear_persistent_embeddings():
    try:
        if os.path.exists(embeddings_persistent_path):
            shutil.rmtree(embeddings_persistent_path)  # Recursively remove the directory and its contents
            print(f"Persistent embeddings directory '{embeddings_persistent_path}' " \
                  f"deleted successfully.")
        else:
            print(f"Directory '{embeddings_persistent_path}' does not exist.")
    except Exception as e:
        print(f"Error deleting persistent embeddings directory: {str(e)}")
