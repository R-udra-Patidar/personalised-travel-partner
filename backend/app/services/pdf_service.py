"""
PDF export service — generates a beautifully formatted travel itinerary PDF using ReportLab.
"""
import io
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


def generate_trip_pdf(trip_data: Dict[str, Any]) -> bytes:
    """
    Generate PDF bytes for a given trip with itinerary and budget estimate.
    Falls back to a basic text document if ReportLab is not available.
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TripTitle',
            parent=styles['Heading1'],
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=8
        )
        subtitle_style = ParagraphStyle(
            'TripSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )
        day_heading_style = ParagraphStyle(
            'DayHeading',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#0D9488'),
            spaceBefore=14,
            spaceAfter=6
        )
        act_title_style = ParagraphStyle(
            'ActivityTitle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#1E293B'),
            fontName='Helvetica-Bold'
        )
        act_desc_style = ParagraphStyle(
            'ActivityDesc',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#475569')
        )

        elements = []

        # Title & Trip summary
        title = trip_data.get("title") or f"Trip to {trip_data.get('destination', 'Travel Destination')}"
        dest = trip_data.get("destination", "Explore")
        days_count = trip_data.get("travel_days", len(trip_data.get("days", [])))
        vibe = trip_data.get("travel_vibe", "Mixed")
        budget_lvl = trip_data.get("budget_level", "Moderate")

        elements.append(Paragraph(title, title_style))
        elements.append(Paragraph(
            f"<b>Destination:</b> {dest} &nbsp;|&nbsp; <b>Duration:</b> {days_count} Days &nbsp;|&nbsp; <b>Vibe:</b> {vibe.title()} &nbsp;|&nbsp; <b>Budget:</b> {budget_lvl.title()}",
            subtitle_style
        ))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=15))

        # Days and Activities
        days = trip_data.get("days", [])
        for day in days:
            day_num = day.get("day_number", 1)
            theme = day.get("theme", "")
            cluster = day.get("location_cluster", "")
            day_title = f"Day {day_num}: {theme}" if theme else f"Day {day_num}"
            if cluster:
                day_title += f" ({cluster})"

            elements.append(Paragraph(day_title, day_heading_style))

            table_data = []
            for act in day.get("activities", []):
                time_slot = act.get("time_slot", "")
                cost = f"${act.get('estimated_cost_usd', 0.0):.2f}"
                act_name = act.get("name", "Activity")
                desc = act.get("description", "")
                loc = act.get("location", "")
                notes = act.get("practical_notes", "")

                text_content = f"<b>{act_name}</b>"
                if loc:
                    text_content += f"<br/><font color='#64748B'>Location: {loc}</font>"
                if desc:
                    text_content += f"<br/>{desc}"
                if notes:
                    text_content += f"<br/><font color='#0D9488'>Tip: {notes}</font>"

                table_data.append([
                    Paragraph(time_slot, act_desc_style),
                    Paragraph(text_content, act_desc_style),
                    Paragraph(cost, act_desc_style)
                ])

            if table_data:
                t = Table(table_data, colWidths=[100, 360, 70])
                t.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(t)
            elements.append(Spacer(1, 10))

        # Budget Breakdown
        budget = trip_data.get("budget_estimate")
        if budget:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("Estimated Budget Breakdown", day_heading_style))
            b_data = [
                ["Category", "Estimated Cost (USD)"],
                ["Accommodation", f"${budget.get('accommodation_estimate', 0.0):.2f}"],
                ["Food & Dining", f"${budget.get('food_estimate', 0.0):.2f}"],
                ["Activities & Sightseeing", f"${budget.get('activities_estimate', 0.0):.2f}"],
                ["Local Transportation", f"${budget.get('transport_estimate', 0.0):.2f}"],
                ["Total Estimated Cost", f"${budget.get('total_estimate', 0.0):.2f}"]
            ]
            bt = Table(b_data, colWidths=[260, 270])
            bt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('LINEBELOW', (0, -1), (-1, -1), 1.5, colors.HexColor('#0D9488')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#F8FAFC')]),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#E6FFFA')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(bt)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    except Exception as exc:
        logger.warning("ReportLab PDF generation error: %s. Using basic fallback.", exc)
        fallback = f"TRIP ITINERARY: {trip_data.get('title')}\nDestination: {trip_data.get('destination')}\n"
        return fallback.encode('utf-8')
