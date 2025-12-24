# Design Document

## Overview

This document outlines the technical design for implementing a comprehensive Commenting System and Share Post via Messages feature for Creaverse DAO. The system will provide Instagram-like commenting functionality with threaded replies and seamless post sharing through the existing messaging infrastructure.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │    Database     │
│                 │    │                 │    │                 │
│ • Comment UI    │◄──►│ • Comment API   │◄──►│ • Comments      │
│ • Share UI      │    │ • Message API   │    │ • Messages      │
│ • Real-time     │    │ • WebSocket     │    │ • Posts         │
│   Updates       │    │   Handler       │    │ • Users         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Integration with Existing Systems

The commenting and sharing system will integrate seamlessly with the current Creaverse DAO infrastructure:

#### **Existing Components Integration**
- **MediaPostCard**: Add comment and share buttons to existing Instagram-style post cards
- **PostCard**: Add comment and share functionality to list-view post cards  
- **Feed**: Integrate with existing background loading system for comment updates
- **User System**: Use existing User interface and authentication system
- **Message System**: Extend current messaging for post sharing functionality

#### **Data Consistency**
- **User.avatar**: Align comment profilePic with existing User.avatar property
- **Post Interface**: Use existing Post type for share functionality
- **Background Loading**: Comments should integrate with existing cached content system
- **Mock Data**: Extend existing mockData.ts for comment and share testing

#### **Visual Consistency**
- **Instagram-Style Design**: Match existing MediaPostCard visual design
- **Mobile Bottom Sheet**: Consistent with current mobile-optimized components
- **Color Scheme**: Use existing category gradients and theme system
- **Animations**: Match existing Framer Motion animation patterns

### Component Architecture

The system consists of several key components:

1. **Comment Management System**: Handles CRUD operations for comments and replies
2. **Share System**: Manages post sharing through messages
3. **Real-time Communication**: WebSocket-based live updates
4. **UI Components**: React components for comment interface and sharing
5. **Data Layer**: Efficient storage and retrieval of comment data

## Components and Interfaces

### Frontend Components

**Integration Note**: These components will integrate with existing `MediaPostCard`, `PostCard`, and Feed components. The design should maintain visual consistency with the current Instagram-style multimedia system.

#### CommentSystem Component
```typescript
interface CommentSystemProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  userId: string;
  postId: string;
  username: string;
  profilePic: string; // Note: Should align with existing User.avatar property
  text: string;
  timestamp: Date;
  replies: Reply[];
  likesCount?: number;
}

interface Reply {
  id: string;
  userId: string;
  parentCommentId: string;
  username: string;
  profilePic: string; // Note: Should align with existing User.avatar property
  text: string;
  timestamp: Date;
}
```

#### ShareSystem Component
```typescript
interface ShareSystemProps {
  post: Post; // Note: Uses existing Post interface from current system
  isOpen: boolean;
  onClose: () => void;
}

interface ShareMessage {
  id: string;
  senderId: string;
  recipientIds: string[];
  postId: string;
  message?: string;
  timestamp: Date;
  postPreview: PostPreview;
}

interface PostPreview {
  id: string;
  thumbnail: string;
  ownerName: string;
  caption: string;
  type: 'image' | 'video' | 'text';
}
```

### Backend API Endpoints

#### Comment API
```typescript
// GET /api/posts/:postId/comments
// POST /api/posts/:postId/comments
// PUT /api/comments/:commentId
// DELETE /api/comments/:commentId
// POST /api/comments/:commentId/replies
// GET /api/comments/:commentId/replies

interface CommentAPI {
  getComments(postId: string, page: number, limit: number): Promise<Comment[]>;
  createComment(postId: string, userId: string, text: string): Promise<Comment>;
  updateComment(commentId: string, text: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  createReply(commentId: string, userId: string, text: string): Promise<Reply>;
  getReplies(commentId: string): Promise<Reply[]>;
}
```

#### Share API
```typescript
// POST /api/posts/:postId/share
// GET /api/messages/:conversationId/shared-posts

interface ShareAPI {
  sharePost(postId: string, recipientIds: string[], message?: string): Promise<ShareMessage[]>;
  getSharedPosts(conversationId: string): Promise<ShareMessage[]>;
}
```

## Data Models

### Comment Data Structure
```typescript
// MongoDB/Database Schema
const CommentSchema = {
  _id: ObjectId,
  postId: ObjectId,
  userId: ObjectId,
  username: String,
  profilePic: String,
  text: String,
  timestamp: Date,
  replies: [{
    _id: ObjectId,
    userId: ObjectId,
    username: String,
    profilePic: String,
    text: String,
    timestamp: Date,
    likesCount: Number // Future feature
  }],
  likesCount: Number, // Future feature
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
};

// Indexes for performance
db.comments.createIndex({ postId: 1, timestamp: -1 });
db.comments.createIndex({ userId: 1 });
db.comments.createIndex({ "replies.userId": 1 });
```

### Share Message Data Structure
```typescript
const ShareMessageSchema = {
  _id: ObjectId,
  senderId: ObjectId,
  recipientId: ObjectId,
  conversationId: ObjectId,
  postId: ObjectId,
  message: String, // Optional message from sender
  postPreview: {
    thumbnail: String,
    ownerName: String,
    caption: String,
    type: String
  },
  timestamp: Date,
  isRead: Boolean,
  createdAt: Date
};

// Indexes for performance
db.shareMessages.createIndex({ conversationId: 1, timestamp: -1 });
db.shareMessages.createIndex({ recipientId: 1, isRead: 1 });
db.shareMessages.createIndex({ postId: 1 });
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Now I'll analyze the acceptance criteria to determine which ones can be tested as properties:

<function_calls>
<invoke name="prework">
<parameter name="featureName">commenting-and-sharing-system

Based on the prework analysis, I'll now convert the testable acceptance criteria into correctness properties:

### Property Reflection

After reviewing all properties identified in the prework, I can consolidate some redundant properties:
- Properties 1.1 and 4.1 both test UI button presence - can be combined into one comprehensive property
- Properties 1.4 and 6.1 both test comment data structure - can be combined
- Properties 8.1 and 6.4 both test pagination - can be combined
- Properties 2.2 and 2.5 both test count updates - can be combined

### Correctness Properties

Property 1: UI Button Presence
*For any* post displayed in the interface, both comment and share buttons should be present and visible
**Validates: Requirements 1.1, 4.1**

Property 2: Comment Interface Opening
*For any* post, clicking the comment button should open the comment interface with post thumbnail, comment count, and comment list
**Validates: Requirements 1.2, 1.3**

Property 3: Comment Data Structure Consistency
*For any* comment displayed or stored, it should contain username, profile picture, comment text, timestamp, and all required database fields
**Validates: Requirements 1.4, 6.1**

Property 4: Input Field Content Support
*For any* text input in comment fields, the system should accept and properly process text, emojis, and @username mentions
**Validates: Requirements 1.5**

Property 5: Comment Creation Completeness
*For any* valid comment submission, the system should create a comment with all required fields and update the post's comment count
**Validates: Requirements 2.1, 2.2**

Property 6: Comment Ownership UI
*For any* comment owned by the current user, edit and delete options should be displayed
**Validates: Requirements 2.3**

Property 7: Comment Edit Preservation
*For any* comment edit operation, the system should update the text while preserving the original timestamp
**Validates: Requirements 2.4**

Property 8: Comment Deletion Consistency
*For any* comment deletion, the system should remove the comment and update the comment count immediately
**Validates: Requirements 2.5**

Property 9: Reply Interface Activation
*For any* comment, clicking the reply button should open a reply input field
**Validates: Requirements 3.1**

Property 10: Reply Parent Linking
*For any* reply creation, the system should properly link the reply to its parent comment
**Validates: Requirements 3.2**

Property 11: Reply Visual Hierarchy
*For any* comment thread with replies, replies should be displayed nested under their parent with visual indentation
**Validates: Requirements 3.3, 9.2**

Property 12: Reply Count Display
*For any* comment with replies, the system should display a "View replies" option with the correct reply count
**Validates: Requirements 3.4**

Property 13: Reply Chronological Ordering
*For any* expanded reply thread, replies should be displayed in chronological order by timestamp
**Validates: Requirements 3.5**

Property 14: Share Interface Opening
*For any* post, clicking the share button should open the send post panel with friend list and search functionality
**Validates: Requirements 4.2**

Property 15: Recipient Selection Functionality
*For any* share operation, the system should allow multiple user selection and optional message input
**Validates: Requirements 4.3**

Property 16: Share Message Creation
*For any* share operation, the system should create the correct number of messages with proper post preview content for each recipient
**Validates: Requirements 4.4, 4.5**

Property 17: Shared Post Display
*For any* received shared post message, it should be displayed as a card in the chat conversation
**Validates: Requirements 5.1**

Property 18: Shared Post Navigation
*For any* shared post card, clicking it should open the original post with current data and full functionality
**Validates: Requirements 5.2, 5.3, 5.5**

Property 19: Share Data Integrity
*For any* post sharing operation, the system should not create duplicate posts in the database
**Validates: Requirements 5.4**

Property 20: Reply Data Nesting
*For any* reply storage operation, the reply data should be properly nested within the parent comment structure
**Validates: Requirements 6.2**

Property 21: Comment Pagination
*For any* comment loading operation, the system should implement pagination and lazy loading for large comment sets
**Validates: Requirements 6.4, 8.1**

Property 22: Real-time Update Propagation
*For any* comment modification, the system should update the database and trigger real-time UI updates for all connected users
**Validates: Requirements 6.5, 8.2**

Property 23: Authentication Verification
*For any* comment attempt, the system should verify user authentication before allowing the operation
**Validates: Requirements 7.1**

Property 24: Flood Protection
*For any* rapid comment posting pattern, the system should implement rate limiting to prevent spam
**Validates: Requirements 7.2**

Property 25: Comment Reporting
*For any* comment report action, the system should flag the comment for moderation review
**Validates: Requirements 7.3**

Property 26: User Blocking
*For any* blocked user relationship, comments from blocked users should be hidden from the blocking user's view
**Validates: Requirements 7.4**

Property 27: Content Filtering
*For any* comment with inappropriate content, the system should filter it when content filtering is enabled
**Validates: Requirements 7.5**

Property 28: Offline Comment Caching
*For any* offline scenario, the system should cache comments and sync them when connection is restored
**Validates: Requirements 8.4**

Property 29: Error Handling Display
*For any* error condition, the system should display appropriate error messages and retry mechanisms
**Validates: Requirements 8.5**

Property 30: Mobile Responsive Design
*For any* mobile device access, the comment interface should display as a bottom sheet for optimal mobile experience
**Validates: Requirements 9.4**

Property 31: Keyboard Focus Management
*For any* comment typing interaction, the system should handle keyboard interactions with proper focus management
**Validates: Requirements 9.5**

## Error Handling

### Comment System Error Handling
- **Network Failures**: Implement retry mechanisms with exponential backoff
- **Authentication Errors**: Redirect to login and preserve comment draft
- **Validation Errors**: Display inline error messages with specific guidance
- **Rate Limiting**: Show cooldown timer and explanation
- **Server Errors**: Display user-friendly error messages with retry options

### Share System Error Handling
- **Recipient Not Found**: Show error and suggest alternative users
- **Message Delivery Failure**: Queue messages for retry and notify user
- **Post Access Denied**: Handle private/deleted posts gracefully
- **Network Issues**: Cache share attempts for later retry

## Testing Strategy

### Dual Testing Approach
The system will use both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Comment creation with various input types
- Reply threading edge cases
- Share message formatting
- Error condition handling
- UI component rendering

**Property-Based Tests**: Verify universal properties across all inputs
- All properties listed above will be implemented as property-based tests
- Each test will run minimum 100 iterations with randomized inputs
- Tests will be tagged with format: **Feature: commenting-and-sharing-system, Property {number}: {property_text}**

### Property-Based Testing Configuration
- **Testing Framework**: Use Jest with fast-check for property-based testing
- **Minimum Iterations**: 100 per property test
- **Test Tagging**: Each property test references its design document property
- **Coverage**: Properties cover all testable acceptance criteria from requirements

### Testing Categories
1. **Comment CRUD Operations**: Create, read, update, delete comments and replies
2. **UI Interaction Testing**: Button clicks, form submissions, navigation
3. **Data Consistency**: Comment counts, reply nesting, timestamp preservation
4. **Real-time Updates**: WebSocket message propagation
5. **Security Testing**: Authentication, authorization, rate limiting
6. **Performance Testing**: Large comment volumes, pagination efficiency
7. **Mobile Responsiveness**: Bottom sheet behavior, touch interactions
8. **Error Scenarios**: Network failures, invalid inputs, server errors

The testing strategy ensures that both specific use cases and general system behavior are thoroughly validated, providing confidence in the system's reliability and correctness.