import enum
from sqlalchemy import (
    BigInteger,
    Column,
    Computed,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY, TSVECTOR, UUID
from sqlalchemy.sql import func
from app.db.session import Base

class ResourceType(str, enum.Enum):
    PAST_QUESTION = "past_question"
    PROJECT = "project"
    LECTURE_NOTE = "lecture_note"
    CODE_PREVIEW = "code_preview"
    OTHER = "other"

class ResourceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    CHANGES_REQUESTED = "changes_requested"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    file_url = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="RESTRICT"))
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"))
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="SET NULL"))
    programming_language = Column(String(50))
    keywords = Column(ARRAY(Text))
    status = Column(
        Enum(
            ResourceStatus,
            name="resource_status",
            values_callable=lambda statuses: [status.value for status in statuses],
        ),
        default=ResourceStatus.PENDING,
        nullable=False,
    )
    search_vector = Column(
        TSVECTOR,
        Computed(
            "setweight(to_tsvector('english', coalesce(title, '')), 'A') || "
            "setweight(to_tsvector('english', coalesce(description, '')), 'B')",
            persisted=True,
        ),
    )
    resource_type = Column(String(32), nullable=False, default=ResourceType.OTHER.value)
    storage_key = Column(Text)
    backend_uploader_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    uploader = relationship("User", back_populates="resources")