from sqlalchemy import BigInteger, CheckConstraint, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class SearchEvent(Base):
    __tablename__ = "backend_search_events"
    __table_args__ = (
        CheckConstraint(
            "query_text IS NULL OR length(btrim(query_text)) BETWEEN 1 AND 200",
            name="backend_search_events_query_text_valid",
        ),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query_text = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="search_events")
