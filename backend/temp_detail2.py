import asyncio
from services.serpapi_client import fetch_job_detail_from_serpapi

async def main():
    job_id = "eyJqb2JfdGl0bGUiOiJTb2Z0d2FyZSBFbmdpbmVlciIsImNvbXBhbnlfbmFtZSI6Ik5vcnRocm9wIEdydW1tYW4iLCJhZGRyZXNzX2NpdHkiOiJMYXNzZWxsZSIsImh0aWRvY2lkIjoiQ0ptN1p3dlZqa2FVd0FBQUFBQUE9PSIsInV1bGUiOiJ3K0NBSVFJQ0lOVlc1cGRHVm9JRTl5WldkdElIazZVbTR0WXoweVFYUT0ifQ=="
    detail = await fetch_job_detail_from_serpapi(job_id)
    if detail:
        print('detail company', detail.company)
        print('title', detail.title)
    else:
        print('no detail')

asyncio.run(main())
