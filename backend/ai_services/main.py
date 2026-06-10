from ai_services.interviewer import app as interviewer_app
from ai_services.summary import app as summary_app
from fastapi import FastAPI

app = FastAPI()

app.mount('/interviewer' , interviewer_app)
app.mount('/summary' , summary_app)