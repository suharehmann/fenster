import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.contact import ContactMessage
from app.models.inquiry import Inquiry
from app.schemas.contact import ContactInput
from app.schemas.inquiry import (
    InquiryDraftInput,
    InquiryInput,
    InquiryListResponse,
    InquiryOut,
    InquiryStatusUpdate,
)
from app.services.emailer import send_admin_mail

router = APIRouter(prefix='/api', tags=['api'])


def to_out(record: Inquiry) -> InquiryOut:
    return InquiryOut(
        id=record.id,
        inquiry_type=record.inquiry_type,
        product_type=record.product_type,
        status=record.status,
        created_at=record.created_at,
        customer={
            'full_name': record.full_name,
            'address': record.address,
            'email': record.email,
            'phone': record.phone,
            'notes': record.notes,
        },
        configuration=record.configuration,
    )


@router.post('/inquiries', response_model=InquiryOut)
def create_inquiry(payload: InquiryInput, db: Session = Depends(get_db)):
    inquiry = Inquiry(
        inquiry_type='final',
        product_type=payload.productType,
        full_name=payload.customer.fullName,
        address=payload.customer.address,
        email=payload.customer.email,
        phone=payload.customer.phone,
        notes=payload.customer.notes,
        status='neu',
        configuration=payload.model_dump(exclude={'customer'}),
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    send_admin_mail(
        subject=f'Neue Anfrage #{inquiry.id}',
        body=f'Neue Anfrage von {inquiry.full_name} ({inquiry.email}) fuer {inquiry.product_type}.',
    )
    return to_out(inquiry)


@router.post('/inquiries/draft', response_model=InquiryOut)
def save_draft(payload: InquiryDraftInput, db: Session = Depends(get_db)):
    inquiry = Inquiry(
        inquiry_type='draft',
        product_type=payload.productType,
        full_name=payload.customer.fullName,
        address=payload.customer.address,
        email=payload.customer.email,
        phone=payload.customer.phone,
        notes=payload.customer.notes,
        status='neu',
        configuration=payload.model_dump(exclude={'customer'}),
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return to_out(inquiry)


@router.post('/contact')
def submit_contact(payload: ContactInput, db: Session = Depends(get_db)):
    message = ContactMessage(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
    )
    db.add(message)
    db.commit()

    send_admin_mail(
        subject='Neue Kontaktanfrage',
        body=f'Kontakt von {payload.name} ({payload.email})\n\n{payload.message}',
    )
    return {'ok': True}


@router.get('/admin/inquiries', response_model=InquiryListResponse)
def list_inquiries(
    q: str = Query(default=''),
    status: str = Query(default=''),
    db: Session = Depends(get_db),
):
    statement = select(Inquiry).order_by(Inquiry.created_at.desc())
    if q:
        q_like = f'%{q}%'
        statement = statement.where(or_(Inquiry.full_name.like(q_like), Inquiry.email.like(q_like)))
    if status:
        statement = statement.where(Inquiry.status == status)

    results = db.scalars(statement).all()
    return InquiryListResponse(items=[to_out(row) for row in results])


@router.patch('/admin/inquiries/{inquiry_id}/status', response_model=InquiryOut)
def patch_status(inquiry_id: int, payload: InquiryStatusUpdate, db: Session = Depends(get_db)):
    row = db.get(Inquiry, inquiry_id)
    if not row:
        raise HTTPException(status_code=404, detail='Anfrage nicht gefunden')

    row.status = payload.status
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_out(row)


@router.get('/admin/inquiries/export')
def export_inquiries(db: Session = Depends(get_db)):
    rows = db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc())).all()
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(['id', 'zeitpunkt', 'kunde', 'email', 'produkt', 'status'])
    for item in rows:
        writer.writerow([item.id, item.created_at.isoformat(), item.full_name, item.email, item.product_type, item.status])

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=inquiries.csv'},
    )
