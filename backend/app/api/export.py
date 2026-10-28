"""
Export endpoints for exporting itineraries to PDF and other formats.
"""
from fastapi import APIRouter, HTTPException, status, Response
from app.database import operations as db
from app.services.pdf_service import generate_trip_pdf

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/{trip_id}/pdf")
def export_trip_as_pdf(trip_id: str):
    """
    Export the complete trip itinerary as a beautifully styled PDF document.
    """
    trip = db.get_trip(trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found."
        )

    pdf_bytes = generate_trip_pdf(trip)
    filename = f"{trip.get('destination', 'travel')}_itinerary.pdf".replace(" ", "_")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
