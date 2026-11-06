import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
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
    REJECTED = "rejected"

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(Enum(ResourceType), nullable=False)
    course_code = Column(String, index=True, nullable=True)
    file_url = Column(String, nullable=False)
    status = Column(Enum(ResourceStatus), default=ResourceStatus.PENDING, nullable=False)
    
    # Foreign Key linking to User table
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship back to User
    uploader = relationship("User", back_populates="resources")