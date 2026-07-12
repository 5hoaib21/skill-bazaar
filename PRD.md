Product Requirements Document — SkillBazaar
Document Information
Field
Details
Product Name
SkillBazaar
Document Status
Draft
Version
2.0
Product Type
Hyper-local experience marketplace
Target Release
V1.0 MVP
Product Manager
Md Shoaib
Database
MongoDB Native Driver — No Mongoose
Payment Provider
Stripe
Host Payout System
Stripe Connect
Frontend
Next.js App Router with TypeScript
Backend
Express.js with TypeScript


1. Executive Summary
SkillBazaar is a community-driven marketplace where people can discover, book, and pay for unique local, in-person experiences hosted by skilled individuals.
Examples of experiences include:
Cooking classes
Pottery workshops
Guitar lessons
Photography walks
Local guided tours
Art and craft sessions
Technology workshops
Fitness or outdoor sessions
The platform connects two primary user groups:
Explorers, who want to discover and book authentic local experiences.
Hosts or Skillers, who want to share their skills, earn money, manage schedules, receive bookings, and collect payments.
SkillBazaar will provide experience discovery, location-based filtering, session scheduling, secure Stripe payments, host payouts, booking management, reviews, and trust-focused moderation.
The MVP will focus only on scheduled local experiences. On-demand repair services, custom quotations, online services, and service bidding will not be included in the first release.

2. Product Vision
SkillBazaar aims to make local skills visible, accessible, and economically valuable.
The product should become the trusted bridge between people who want to learn or explore something new and local experts who want to earn by sharing what they know.

3. Core Value Proposition
3.1 For Explorers
SkillBazaar enables Explorers to:
Discover authentic local experiences
Search by category, location, date, and price
View host information and ratings
Check available sessions and remaining seats
Pay securely through Stripe
Manage upcoming and previous bookings
Review completed experiences
3.2 For Hosts or Skillers
SkillBazaar enables Hosts to:
Create a public host profile
Publish local experiences
Add multiple dates and sessions
Set prices and participant limits
Receive and manage bookings
Receive payments through Stripe
Track upcoming sessions
Build reputation through verified reviews

4. Problem Statement
Discovering unique local experiences offered by individuals remains difficult.
Social media groups are unstructured, search results are unreliable, and users often cannot verify:
Whether an experience is currently available
Whether the host is trustworthy
How much the experience costs
Whether seats are available
How to make a secure payment
What happens after cancellation
Local experts also lack a simple platform where they can:
List their skills professionally
Create schedules
Manage participant capacity
Accept secure payments
Handle cancellations
Build a public reputation
SkillBazaar addresses both problems through a structured local experience marketplace.

5. Product Goals
The MVP should allow a complete marketplace transaction:
A Host creates and publishes an experience.
The Host adds one or more available sessions.
An Explorer discovers the experience.
The Explorer selects a session and participant count.
The Explorer pays through Stripe.
The booking is confirmed after Stripe webhook verification.
The Host manages the booking and conducts the experience.
The Explorer reviews the experience after completion.
The Host receives the payout through Stripe Connect.

6. Non-Goals for MVP
The following features are outside the MVP scope:
On-demand repair services
Custom service quotations
Service bidding
Direct user-to-user messaging
Online or virtual experiences
Subscription plans
Discount coupons
Gift cards
Multi-language support
Native mobile applications
AI-based recommendations
Advanced analytics charts
Recurring subscription payments
Dynamic surge pricing
Multiple currencies in one booking
Split payments between multiple Hosts
These features may be considered for later releases.

7. Target Users
7.1 Curious Explorer
An Explorer wants to:
Discover interesting weekend activities
Learn a new skill
Find experiences nearby
Compare price, ratings, and schedules
Book and pay securely
Receive clear booking confirmation
Explorer priorities:
Clear information
Real photos
Location
Availability
Transparent price
Host trust
Reviews
Easy cancellation
7.2 Passionate Skiller or Host
A Host is a skilled individual who wants to:
Share a skill or passion
Create scheduled experiences
Earn money
Control session availability
Manage bookings
Receive payouts
Build a trusted public profile
Examples:
Pottery artist
Cooking instructor
Guitar teacher
Photographer
Local tour guide
Fitness trainer
Craft specialist
Technology mentor
7.3 Platform Admin
An Admin manages:
Users
Host verification
Experience moderation
Reports
Suspended accounts
Refund disputes
Platform categories
Featured experiences

8. User Roles and Permissions
A regular user can act as both an Explorer and a Host.
A separate permanent host role is not required. Hosting capabilities are activated when a user creates a Host profile.
8.1 User Role
A user can:
Browse experiences
Register and log in
Book experiences
Make Stripe payments
View personal bookings
Cancel eligible bookings
Submit reviews after completion
Create a Host profile
Become a Host
8.2 Host Capabilities
A user with an active Host profile can:
Create experiences
Edit owned experiences
Publish or pause experiences
Add and manage sessions
View participant bookings
Cancel sessions
View earnings and payout status
Connect a Stripe account
Receive Stripe payouts
8.3 Admin Role
An Admin can:
Approve or reject experiences
Approve or reject Host verification
Suspend users
Archive inappropriate listings
Review reports
View bookings
Review refund disputes
Manage categories

9. Core User Journeys
9.1 Explorer Booking Journey
Explorer visits the homepage.
Explorer searches by keyword or location.
Explorer opens the Explore page.
Explorer applies category, date, price, and location filters.
Explorer opens an experience details page.
Explorer chooses an available session.
Explorer selects the number of participants.
System validates available seats.
System displays the total price.
Explorer proceeds to Stripe Checkout.
Stripe processes the payment.
Stripe sends a verified webhook to the backend.
Backend marks the booking as confirmed.
Explorer receives booking confirmation.
Host sees the booking in the Host dashboard.
Explorer attends the experience.
Host or system marks the booking as completed.
Explorer becomes eligible to submit a review.
9.2 Host Publishing Journey
User creates an account.
User creates a Host profile.
User completes Stripe Connect onboarding.
User creates an experience as a draft.
User uploads images and adds location information.
User creates one or more sessions.
User submits the experience for moderation.
Admin approves the experience.
Experience becomes publicly visible.
Host receives bookings and payments.
Host manages participants and session status.
Stripe transfers eligible payout to the Host.

10. Information Architecture and Routes
10.1 Public Routes
/
 /explore
 /experiences/[id]
 /hosts/[id]
 /about
 /contact
 /privacy
 /terms
 /cancellation-policy
 /login
 /register

10.2 Protected User Routes
/dashboard
/dashboard/bookings
/dashboard/bookings/[id]
/dashboard/profile
/dashboard/become-a-host

10.3 Protected Host Routes
/dashboard/host
/dashboard/host/listings
/dashboard/host/listings/new
/dashboard/host/listings/[id]/edit
/dashboard/host/listings/[id]/sessions
/dashboard/host/bookings
/dashboard/host/earnings
/dashboard/host/payouts
/dashboard/host/settings

10.4 Admin Routes
/admin
/admin/experiences
/admin/hosts
/admin/users
/admin/bookings
/admin/reports
/admin/refunds
/admin/categories

10.5 Payment Routes
/checkout/success
/checkout/cancelled


11. Functional Requirements
11.1 Global UI and Design System
The interface must use a consistent visual system.
Primary Palette
Deep Teal
Warm Amber
Off-White
Charcoal Gray for primary text
Semantic Colors
The design system must also include:
Success
Warning
Error
Information
Disabled state
Spacing
Use an 8px base spacing system.
A 4px half-step may be used for compact interface elements.
Components
Reusable components should include:
Navbar
Footer
Search bar
Experience card
Session selector
Price summary
Booking status badge
Host profile card
Review card
Confirmation modal
Empty state
Error state
Skeleton loader
Pagination
Toast notification
Cards of the same component type should maintain consistent height. Different component types do not need identical height.
Accessibility
The interface must support:
WCAG 2.1 AA color contrast
Keyboard navigation
Visible focus styles
Accessible labels
Accessible modal focus trapping
Screen-reader-friendly validation messages
Minimum 44×44 pixel touch targets
Reduced motion preferences
Alternative text for images

12. Homepage Requirements
Route
/

12.1 Navbar
Logged-out navigation:
Explore
How It Works
Become a Host
Login
Register
Logged-in navigation:
Explore
My Bookings
Host Dashboard
Profile
Logout
The navbar should be sticky and responsive.
12.2 Hero Section
The Hero section should include:
Main title: “Discover Skills and Experiences Near You”
Supporting description
Keyword search input
Location input
Date input
Search button
“Become a Host” secondary CTA
An optimized image or lightweight CSS animation should be used instead of an autoplay background video in the MVP.
12.3 Popular Categories
Display popular categories such as:
Cooking
Arts and Crafts
Music
Outdoors
Technology
Photography
Fitness
Local Tours
Selecting a category should open the Explore page with the corresponding category query parameter.
Example:
/explore?category=cooking

12.4 Latest Experiences
Display the latest four approved and published experiences.
The section should only include experiences that:
Have at least one future available session
Are approved
Are published
Are not archived
12.5 How It Works
Three steps:
Discover
Book and Pay
Attend and Experience
12.6 Host CTA
CTA text:
“Turn Your Skill Into an Experience”
The CTA links to:
/dashboard/become-a-host

12.7 Footer
Footer links:
About
Contact
Privacy Policy
Terms and Conditions
Cancellation Policy
Become a Host
Social media links

13. Explore Page Requirements
Route
/explore

13.1 Search and Filters
The Explore page must support:
Keyword search
Category filter
City filter
Area filter
Date filter
Minimum price
Maximum price
Participant count
Minimum rating
Available sessions only
13.2 Sorting
Available sorting options:
Newest
Price: Low to High
Price: High to Low
Highest Rated
Most Reviewed
13.3 URL Query Parameters
All filters, sorting, and pagination must be reflected in the URL.
Example:
/explore?search=pottery&city=dhaka&category=arts&date=2026-08-20&maxPrice=2000&page=2&sort=price_asc

13.4 Experience Card
Each Experience card should display:
Cover image
Title
Category
City and area
Host name
Starting price
Next available date
Average rating
Number of reviews
Remaining seat indicator when availability is low
13.5 Results Grid
Responsive grid:
1 column on small mobile
2 columns on tablet
3 columns on medium desktop
4 columns on large desktop
13.6 States
The page must include:
Loading skeletons
Empty search state
API error state
Retry action
No available session state
13.7 Pagination
Pagination must update URL query parameters.
The backend should support page and limit parameters.
Example:
GET /api/experiences?page=2&limit=12


14. Experience Details Page
Route
/experiences/[id]

14.1 Image Gallery
The page should support:
One cover image
Up to five total images
Thumbnail navigation
Accessible image alt text
Responsive image optimization
14.2 Main Information
Display:
Experience title
Category
Host information
Average rating
Review count
City and approximate area
Starting price
Duration
Capacity
Age requirement, when applicable
14.3 Description Sections
The page should include:
Short overview
Full description
What is included
What participants should bring
Participant requirements
Safety instructions
Cancellation policy
14.4 Session Selector
The user should be able to view:
Available dates
Start and end times
Remaining seats
Price per participant
Session status
Unavailable or full sessions must not be selectable.
14.5 Location Privacy
Before booking confirmation:
Display city and approximate area
Do not expose sensitive private addresses
After confirmed booking:
Display the exact meeting address in the booking details page
14.6 Booking CTA
The booking area should include:
Selected session
Participant count
Price per participant
Platform fee, when applicable
Taxes, when applicable
Total amount
“Continue to Payment” button

15. Authentication Requirements
Routes
/login
/register

15.1 Registration
Required fields:
Name
Email
Password
Confirm password
Validation:
Name: 2–80 characters
Valid email format
Email must be unique
Password: minimum 8 characters
Password should contain letters and numbers
15.2 Login
Required fields:
Email
Password
The backend must return generic login errors to avoid exposing whether an email exists.
15.3 JWT Strategy
Authentication will use JWT stored in an httpOnly cookie.
Cookie requirements:
httpOnly: true
secure: true in production
Appropriate sameSite policy
Defined expiration
Cleared during logout
Protected webpage requests should redirect unauthenticated users to /login.
Protected API requests should return:
{
  "success": false,
  "message": "Authentication required"
}

with HTTP status:
401 Unauthorized

Ownership or role failures should return:
403 Forbidden

15.4 Password Storage
Passwords must be hashed using bcrypt before being stored in MongoDB.
Plain-text passwords must never be stored or logged.
15.5 Demo Login
A demo login may be provided for testing.
The demo account must:
Use isolated demo data
Prevent destructive actions
Reset periodically
Never expose real user or payment data

16. Host Profile and Onboarding
Route
/dashboard/become-a-host

16.1 Host Profile Fields
Display name
Profile image
Bio
Skills
Languages
City
Contact phone
Experience summary
Identity verification status
Stripe Connect account status
16.2 Host Status
inactive
pending_verification
active
suspended
rejected

16.3 Stripe Connect Onboarding
Before receiving bookings, the Host must complete Stripe Connect onboarding.
The backend should:
Create or retrieve a Stripe connected account.
Generate an onboarding link.
Redirect the Host to Stripe onboarding.
Receive account updates through Stripe webhooks.
Mark the Host payout account as ready only after required Stripe capabilities are enabled.
Host payment readiness should be tracked separately from profile verification.

17. Create and Edit Experience
Routes
/dashboard/host/listings/new
/dashboard/host/listings/[id]/edit

17.1 Experience Fields
Basic Information
Title
Short description
Full description
Category
Tags
Duration
Price per participant
Maximum capacity
Minimum participant age
Language
What is included
What participants should bring
Safety notes
Cancellation policy
Location
Country
City
Area
Full address
Latitude
Longitude
Location visibility setting
Images
Minimum one cover image
Maximum five images
Alternative text for each image
17.2 Validation Rules
Title:
Required
String
5–100 characters
Short description:
Required
Maximum 160 characters
Full description:
Required
Minimum 100 characters
Price:
Required
Positive number
Stored in the smallest currency unit when communicating with Stripe
Capacity:
Required
Integer
Minimum 1
Duration:
Required
Stored in minutes
Images:
At least one required
Valid image format
Defined file size limit
Location:
City and area required
Full address required for booking
Coordinates recommended
17.3 Experience Status
draft
pending_review
published
paused
rejected
archived

17.4 Experience Actions
Hosts can:
Save as draft
Submit for review
Edit
Preview
Publish after approval
Pause
Archive
Manage sessions
An experience with existing bookings should not be permanently deleted.

18. Session and Availability Management
Route
/dashboard/host/listings/[id]/sessions

A session represents a specific scheduled occurrence of an experience.
Hosts can:
Add a session
Edit a future session
Cancel a session
View booked seats
View remaining capacity
Duplicate a session
18.1 Session Fields
Experience ID
Start date and time
End date and time
Capacity
Reserved seats
Confirmed seats
Status
Booking cutoff time
Created timestamp
Updated timestamp
18.2 Session Status
scheduled
full
cancelled
completed

18.3 Session Rules
Session date must be in the future when created.
End time must be after start time.
Capacity cannot be lower than existing confirmed bookings.
A cancelled session cannot receive new bookings.
A completed session cannot be edited.
The Host must not cancel a session without triggering the required refund flow.

19. Booking and Stripe Payment Flow
19.1 Payment Technology
SkillBazaar will use:
Stripe Checkout for customer payment
Stripe Connect for Host onboarding and payout
Stripe webhooks for authoritative payment confirmation
Stripe Refunds for eligible refund processing
The frontend must never mark a booking as paid based only on a redirect URL.
Payment confirmation must come from a verified Stripe webhook.
19.2 Booking Creation Flow
User selects a session.
User selects participant count.
Backend validates:
Session exists
Session is active
Session is in the future
Requested seats are available
Experience is published
Host Stripe account is ready
Backend calculates price using database values.
Backend temporarily reserves the requested seats.
Backend creates a pending booking.
Backend creates a Stripe Checkout Session.
User is redirected to Stripe Checkout.
Stripe processes the payment.
Stripe sends a webhook.
Backend verifies the webhook signature.
Backend updates the payment and booking status.
Reserved seats become confirmed seats.
User receives booking confirmation.
19.3 Price Calculation
The client must never send the authoritative product price.
The backend must calculate:
subtotal = pricePerParticipant × participantCount
platformFee = configured platform fee
tax = applicable tax
total = subtotal + platformFee + tax

All Stripe amounts should be stored and transmitted in the smallest currency unit.
Example:
BDT 1,200.00 → 120000 poisha-equivalent unit only when supported according to Stripe currency rules

The exact currency handling implementation must follow Stripe-supported currency rules.
19.4 Seat Reservation
Seats should be held temporarily while the user completes payment.
The hold should expire after a defined period, such as 15 minutes.
When payment:
Succeeds: reserved seats become confirmed.
Fails: reserved seats are released.
Expires: reserved seats are released.
Is cancelled before completion: reserved seats are released.
Seat updates must use atomic MongoDB operations to prevent overbooking.
19.5 Booking Status
pending_payment
confirmed
cancelled
completed

19.6 Payment Status
unpaid
processing
paid
failed
partially_refunded
refunded

19.7 Stripe Webhooks
Required webhook events may include:
Checkout session completed
Checkout session expired
Payment intent succeeded
Payment intent failed
Charge refunded
Connected account updated
Payout paid
Payout failed
Webhook requirements:
Verify Stripe signature
Use raw request body for signature verification
Process events idempotently
Store processed Stripe event IDs
Return successful HTTP status only after safe processing
Never expose webhook secrets to the client
19.8 Stripe Connect and Platform Fee
SkillBazaar may collect a platform fee from each booking.
The payment flow should support:
Host connected account
Platform application fee
Host payout
Stripe processing fee
Refund adjustments
The exact platform fee percentage must be configurable and should not be hardcoded throughout the application.
19.9 Geographic Limitation
Launch countries must support the required Stripe and Stripe Connect capabilities.
The platform should not enable paid Host onboarding in unsupported countries.

20. Cancellation and Refund Requirements
20.1 Explorer Cancellation
The Explorer can cancel a confirmed booking according to the selected experience’s cancellation policy.
Example policy:
Full refund more than 48 hours before the session
Partial refund between 24 and 48 hours
No refund within 24 hours
The final policy should be configurable.
20.2 Host Cancellation
When a Host cancels a session:
All affected users must be notified.
Eligible payments must be refunded.
Booking statuses must be updated.
Seats must be released.
Host cancellation count should be recorded.
20.3 Refund Processing
Refunds must be initiated from the backend.
The backend should store:
Stripe refund ID
Refund amount
Refund reason
Refund status
Requested timestamp
Completed timestamp
Refund status should be updated through Stripe webhook events.

21. Explorer Dashboard
Route
/dashboard/bookings

The Explorer dashboard should include:
Upcoming bookings
Completed bookings
Cancelled bookings
Payment status
Refund status
Exact meeting address for confirmed bookings
Host contact information where appropriate
Cancellation action
Review action after completion
21.1 Booking Details
The booking details page should display:
Booking reference
Experience title
Session date and time
Number of participants
Price breakdown
Payment status
Booking status
Host information
Exact location
Cancellation policy
Refund information

22. Host Dashboard
Route
/dashboard/host

The Host dashboard should display:
Total published experiences
Upcoming sessions
Pending bookings
Confirmed participants
Completed bookings
Gross booking amount
Platform fees
Estimated Host earnings
Payout status
Advanced charts are not required in the MVP.
22.1 Host Booking Management
The Host should be able to:
View bookings by session
View participant name and booking quantity
Export or view participant list
Mark attendance
Mark a session as completed
Cancel a session
View refund status
The Host must not be able to access bookings belonging to another Host.

23. Reviews and Ratings
Only users with a completed booking may submit a review.
23.1 Review Rules
One review per booking
Rating from 1 to 5
Optional text comment
Review must be linked to a completed booking
Users cannot review their own experience
Admin can hide reviews that violate policy
Review edits may be allowed within a limited period
23.2 Rating Calculation
Experience rating should be calculated from approved reviews.
The experience document may store denormalized summary values:
Average rating
Review count
The individual reviews remain the source of truth.

24. Trust, Safety, and Moderation
24.1 Experience Moderation
New experiences should follow:
draft → pending_review → published or rejected

Admins should be able to add a rejection reason.
24.2 Host Verification
Possible Host verification statuses:
unverified
pending
verified
rejected

Host verification and Stripe payment verification are separate processes.
24.3 Reporting
Users should be able to report:
Experience
Host
Review
Safety concern
Misleading information
Prohibited service
24.4 Prohibited Content
The platform must not allow experiences involving:
Illegal activities
Dangerous unlicensed activities
Misleading financial schemes
Adult sexual services
Controlled substances
Weapons training where prohibited
Fraudulent or deceptive services
Hate or harassment
24.5 Admin Actions
Admins can:
Hide content
Archive experiences
Suspend users
Reject Host profiles
Flag bookings
Review refund disputes
Add internal moderation notes

25. Additional Pages
25.1 About Page
Route:
/about

Content:
SkillBazaar mission
Community values
How the platform works
Trust and safety principles
Team information
Real team information should be used. Stock team identities should not be presented as real employees.
25.2 Contact Page
Route:
/contact

Fields:
Name
Email
Subject
Message
Contact requests may be:
Stored in MongoDB
Sent through an email provider
Both stored and emailed
The form should include:
Server-side validation
Rate limiting
Honeypot or CAPTCHA protection
Success and error states
25.3 Legal Pages
Required legal pages:
Privacy Policy
Terms and Conditions
Cancellation Policy
Host Agreement
Payment and Refund Policy

26. API Requirements
All API responses should follow a consistent structure.
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

26.1 Authentication APIs
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

26.2 Experience APIs
GET    /api/experiences
GET    /api/experiences/:id
POST   /api/experiences
PATCH  /api/experiences/:id
DELETE /api/experiences/:id
PATCH  /api/experiences/:id/status

DELETE should normally archive the experience rather than permanently remove it.
26.3 Session APIs
GET    /api/experiences/:id/sessions
POST   /api/experiences/:id/sessions
PATCH  /api/sessions/:id
DELETE /api/sessions/:id
PATCH  /api/sessions/:id/cancel

26.4 Booking APIs
POST  /api/bookings
GET   /api/bookings/me
GET   /api/bookings/:id
PATCH /api/bookings/:id/cancel

GET   /api/host/bookings
GET   /api/host/sessions/:sessionId/bookings
PATCH /api/bookings/:id/complete

26.5 Payment APIs
POST /api/payments/create-checkout-session
POST /api/payments/refunds
POST /api/webhooks/stripe

The Stripe webhook endpoint must not use standard JSON parsing before signature verification.
26.6 Host APIs
POST  /api/hosts/profile
GET   /api/hosts/me
PATCH /api/hosts/me
GET   /api/hosts/:id

POST /api/stripe/connect/account
POST /api/stripe/connect/onboarding-link
GET  /api/stripe/connect/status

26.7 Review APIs
GET   /api/experiences/:id/reviews
POST  /api/reviews
PATCH /api/reviews/:id
DELETE /api/reviews/:id

26.8 Admin APIs
GET   /api/admin/experiences
PATCH /api/admin/experiences/:id/moderate

GET   /api/admin/hosts
PATCH /api/admin/hosts/:id/verify

GET   /api/admin/reports
PATCH /api/admin/reports/:id

PATCH /api/admin/users/:id/status


27. Database Architecture
27.1 Database Technology
SkillBazaar will use:
MongoDB
MongoDB Native Node.js Driver
TypeScript interfaces
Zod validation
Mongoose must not be installed or used.
Collections should be accessed using typed MongoDB collections.
Example:
interface ExperienceDocument {
  _id?: ObjectId;
  title: string;
  hostId: ObjectId;
  status: "draft" | "pending_review" | "published" | "paused" | "rejected" | "archived";
}

const experiencesCollection =
  db.collection<ExperienceDocument>("experiences");

MongoDB generic Document should not replace proper domain interfaces.

28. MongoDB Collections
Core MVP collections:
users
experiences
sessions
bookings
reviews
stripeEvents
reports
contactMessages
categories


29. Users Collection
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "user | admin",
  "profileImageUrl": "string | null",
  "phone": "string | null",
  "status": "active | suspended | deleted",
  "hostProfile": {
    "isHost": "boolean",
    "displayName": "string | null",
    "bio": "string | null",
    "skills": ["string"],
    "languages": ["string"],
    "city": "string | null",
    "verificationStatus": "unverified | pending | verified | rejected",
    "stripeAccountId": "string | null",
    "stripeOnboardingComplete": "boolean",
    "stripeChargesEnabled": "boolean",
    "stripePayoutsEnabled": "boolean"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
email — unique
role
status
hostProfile.isHost
hostProfile.verificationStatus


30. Experiences Collection
{
  "_id": "ObjectId",
  "hostId": "ObjectId",
  "title": "string",
  "slug": "string",
  "shortDescription": "string",
  "fullDescription": "string",
  "category": "string",
  "tags": ["string"],
  "language": "string",
  "durationMinutes": "number",
  "pricePerParticipant": "number",
  "currency": "string",
  "defaultCapacity": "number",
  "minimumAge": "number | null",
  "includedItems": ["string"],
  "participantRequirements": ["string"],
  "safetyNotes": ["string"],
  "cancellationPolicyId": "string",
  "images": [
    {
      "url": "string",
      "alt": "string",
      "isCover": "boolean"
    }
  ],
  "location": {
    "country": "string",
    "city": "string",
    "area": "string",
    "address": "string",
    "latitude": "number | null",
    "longitude": "number | null",
    "publicLocationLabel": "string"
  },
  "status": "draft | pending_review | published | paused | rejected | archived",
  "moderation": {
    "reviewedBy": "ObjectId | null",
    "reviewedAt": "Date | null",
    "rejectionReason": "string | null"
  },
  "ratingSummary": {
    "average": "number",
    "count": "number"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
slug — unique
hostId
category
status
location.city
location.area
pricePerParticipant
ratingSummary.average
createdAt

A text index should support search across:
title
shortDescription
fullDescription
tags


31. Sessions Collection
{
  "_id": "ObjectId",
  "experienceId": "ObjectId",
  "hostId": "ObjectId",
  "startAt": "Date",
  "endAt": "Date",
  "capacity": "number",
  "reservedSeats": "number",
  "confirmedSeats": "number",
  "bookingCutoffAt": "Date",
  "status": "scheduled | full | cancelled | completed",
  "cancelledAt": "Date | null",
  "cancellationReason": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
experienceId
hostId
startAt
status
experienceId + startAt


32. Bookings Collection
{
  "_id": "ObjectId",
  "bookingReference": "string",
  "userId": "ObjectId",
  "hostId": "ObjectId",
  "experienceId": "ObjectId",
  "sessionId": "ObjectId",
  "participantCount": "number",
  "currency": "string",
  "subtotalAmount": "number",
  "platformFeeAmount": "number",
  "taxAmount": "number",
  "totalAmount": "number",
  "hostEarningAmount": "number",
  "bookingStatus": "pending_payment | confirmed | cancelled | completed",
  "paymentStatus": "unpaid | processing | paid | failed | partially_refunded | refunded",
  "seatHoldExpiresAt": "Date | null",
  "stripe": {
    "checkoutSessionId": "string | null",
    "paymentIntentId": "string | null",
    "chargeId": "string | null",
    "refundIds": ["string"],
    "connectedAccountId": "string | null"
  },
  "cancellation": {
    "cancelledBy": "user | host | admin | null",
    "reason": "string | null",
    "cancelledAt": "Date | null"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
bookingReference — unique
userId
hostId
experienceId
sessionId
bookingStatus
paymentStatus
seatHoldExpiresAt
stripe.checkoutSessionId
stripe.paymentIntentId


33. Reviews Collection
{
  "_id": "ObjectId",
  "bookingId": "ObjectId",
  "experienceId": "ObjectId",
  "hostId": "ObjectId",
  "reviewerId": "ObjectId",
  "rating": "number",
  "comment": "string",
  "status": "published | hidden | flagged",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
bookingId — unique
experienceId
hostId
reviewerId
status


34. Stripe Events Collection
The system must store processed Stripe event IDs to prevent duplicate webhook processing.
{
  "_id": "ObjectId",
  "stripeEventId": "string",
  "eventType": "string",
  "processed": "boolean",
  "processedAt": "Date | null",
  "error": "string | null",
  "createdAt": "Date"
}

Index:
stripeEventId — unique


35. Reports Collection
{
  "_id": "ObjectId",
  "reporterId": "ObjectId",
  "targetType": "experience | host | review | user",
  "targetId": "ObjectId",
  "reason": "string",
  "details": "string",
  "status": "open | reviewing | resolved | dismissed",
  "reviewedBy": "ObjectId | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}


36. Data Validation
Zod must validate:
Client form input
API request body
URL parameters
Query parameters
Environment variables
Webhook-related internal data where appropriate
Client-side validation is for user experience.
Server-side validation is mandatory for security.
The backend must not trust data received from the frontend.

37. MongoDB Transaction and Concurrency Requirements
MongoDB transactions or atomic operations should be used for critical booking operations.
Critical operations include:
Reserving seats
Confirming seats after payment
Releasing expired seat holds
Cancelling bookings
Refunding Host-cancelled sessions
Updating booking and session status together
Seat reservation should use conditional atomic updates.
Example condition:
capacity - reservedSeats - confirmedSeats >= requestedParticipantCount

The booking should fail if sufficient seats are no longer available.

38. Technology Stack
Layer
Technology
Purpose
Frontend
Next.js App Router
Public pages, dashboards, routing and SEO
Frontend Language
TypeScript
Typed components and API contracts
Styling
Tailwind CSS
Responsive design and design-system consistency
Backend Runtime
Node.js
Server runtime
Backend Framework
Express.js
REST API and middleware
Backend Language
TypeScript
Typed routes, services and database operations
Database
MongoDB Native Driver
Flexible document storage without Mongoose
Validation
Zod
Shared input and request validation
Authentication
JWT in httpOnly cookie
Protected sessions and APIs
Password Hashing
bcrypt
Secure password hashing
Payments
Stripe Checkout
Customer payment processing
Host Payouts
Stripe Connect
Host onboarding and payouts
Image Storage
Cloud image service
Experience and profile image uploads
Email
Transactional email provider
Booking and cancellation notifications
Logging
Structured logger
Production debugging and monitoring


39. Frontend Architecture
The frontend should use:
Server Components for public data where appropriate
Client Components only for interactive interfaces
Reusable typed components
Centralized API client
Centralized error handling
Route-level loading states
Route-level error boundaries
Query parameter-driven filtering
Responsive image optimization
Suggested structure:
src/
  app/
  components/
  features/
    auth/
    experiences/
    sessions/
    bookings/
    payments/
    hosts/
    reviews/
  lib/
  services/
  schemas/
  types/


40. Backend Architecture
The Express backend should follow a layered architecture:
src/
  config/
  controllers/
  routes/
  services/
  repositories/
  middleware/
  schemas/
  types/
  utils/
  database/
  webhooks/

Responsibilities:
Routes define endpoints.
Middleware handles authentication, validation, and permissions.
Controllers handle HTTP input and output.
Services contain business logic.
Repositories contain MongoDB queries.
Webhook handlers process Stripe events.
Zod schemas validate incoming data.
MongoDB queries should not be written directly throughout controllers.

41. Security Requirements
The platform must implement:
Bcrypt password hashing
JWT verification
Secure httpOnly cookies
CSRF protection for cookie-based mutations
Rate limiting
Input validation
Output sanitization where appropriate
Ownership verification
Role-based authorization
MongoDB query safety
Stripe webhook signature verification
Environment variable protection
Secure HTTP headers
CORS configuration
Request body size limits
File upload validation
Login attempt throttling
No sensitive data in logs
Public mutation endpoints are limited to:
Registration
Login
Contact form
Stripe webhook
These endpoints must still use validation and rate limiting.

42. Performance Requirements
42.1 Frontend
Mobile LCP at the 75th percentile: under 2.5 seconds
CLS: under 0.1
Optimized image delivery
Lazy loading for non-critical images
Pagination instead of loading all experiences
Avoid heavy homepage video in MVP
42.2 Backend
Standard read API p95 response time target: under 500ms
Indexed database queries
Paginated listing endpoints
Avoid unnecessary aggregation
Cache suitable public data when appropriate
42.3 Payment Reliability
Webhook processing must be idempotent
Duplicate Stripe events must not create duplicate bookings
Client redirects must not be treated as payment confirmation
Payment failures must not consume permanent seats

43. SEO Requirements
Public experience pages should include:
Unique title
Meta description
Open Graph metadata
Canonical URL
Structured data where appropriate
Search-engine-readable experience information
Optimized slugs
Sitemap entries for published experiences
Draft, rejected, paused, and archived experiences should not be indexed.

44. Notification Requirements
MVP email notifications:
Explorer
Booking confirmed
Payment failed
Booking cancelled
Refund initiated
Refund completed
Session reminder
Session updated
Session cancelled
Host
New booking
Booking cancelled
Session approaching
Stripe onboarding incomplete
Payout successful
Payout failed
In-app notifications may be added after the MVP.

45. Analytics Events
Track events such as:
homepage_viewed
search_submitted
filter_applied
experience_viewed
session_selected
checkout_started
payment_succeeded
payment_failed
booking_confirmed
booking_cancelled
host_onboarding_started
host_onboarding_completed
experience_draft_created
experience_submitted
experience_published
review_submitted

Personally sensitive payment information must not be included in analytics payloads.

46. Success Metrics
46.1 Discovery
At least 25% of Explore page visitors open an experience details page.
Search-to-details click-through rate should be measured.
No-result search rate should remain below 20% after sufficient inventory exists.
46.2 Explorer Activation
At least 5% of experience details visitors start checkout.
At least 60% of users who start Stripe Checkout complete payment.
Booking cancellation reasons should be tracked.
46.3 Host Activation
At least 40% of users who start Host onboarding complete their Host profile.
At least 50% of approved Hosts publish their first experience.
Listing form completion rate should be at least 60%.
46.4 Marketplace Health
At least 30% of published experiences receive one booking within the initial measurement period.
Host cancellation rate should remain below 5%.
Payment failure rate should be monitored.
Refund and dispute rates should be monitored.
46.5 Reliability
API error rate below 1%
No duplicate confirmed bookings from repeated Stripe events
No overbooking caused by concurrent requests
No unhandled promise rejections in production
Payment webhook failures must trigger alerts

47. MVP Priority
Must Have
Registration, login, and logout
JWT authentication
Explorer and Host capabilities
Host profile
Stripe Connect onboarding
Experience creation and editing
Experience moderation
Session management
Location information
Explore search and filters
Experience details
Seat availability
Stripe Checkout
Stripe webhook handling
Booking confirmation
Explorer booking dashboard
Host booking dashboard
Cancellation
Stripe refund handling
Responsive UI
Loading, empty, and error states
Basic Admin moderation
Should Have
Email notifications
Verified booking reviews
Host public profile
Image upload
Reporting system
Basic payout information
Session reminders
Future Release
Favorites
Direct messaging
Advanced Host analytics
Recharts dashboard
Coupons
Gift cards
Subscription plans
Maps and radius search
AI recommendations
Online experiences
On-demand services
Custom quotations
Mobile applications

48. Release Acceptance Criteria
The MVP is ready for release when:
A user can register, log in, and log out securely.
A user can create and complete a Host profile.
A Host can complete Stripe Connect onboarding.
A Host can create, edit, and submit an experience.
An Admin can approve or reject an experience.
A Host can create multiple future sessions.
An Explorer can search and filter experiences.
An Explorer can view available sessions and seats.
An Explorer can select participant count.
The backend calculates the authoritative price.
An Explorer can complete Stripe Checkout.
A verified Stripe webhook confirms the booking.
Concurrent booking requests cannot overbook a session.
An Explorer can view and cancel eligible bookings.
A Host can view upcoming bookings and participant counts.
A Host cancellation triggers the appropriate refund process.
A completed booking can receive one verified review.
Unauthorized users cannot modify another user’s data.
Payment, booking, loading, error, and empty states work correctly.
The application works properly on mobile, tablet, and desktop.
No payment secret, JWT secret, or database credential is exposed to the client.
MongoDB Native Driver is used throughout the backend, with no Mongoose dependency.
Stripe webhook processing is verified and idempotent.
Production logs contain no unhandled promise rejection.
Legal and cancellation policies are accessible.

49. Key Product Decisions
The following decisions are final for the MVP:
SkillBazaar will focus on scheduled in-person experiences.
A user can act as both Explorer and Host.
MongoDB Native Driver will be used.
Mongoose will not be used.
Stripe Checkout will handle customer payments.
Stripe Connect will handle Host onboarding and payouts.
Payment confirmation will depend on Stripe webhooks.
Experiences can contain multiple sessions.
Location is a required part of the marketplace.
Exact private addresses will only be shown to confirmed participants.
New experiences require moderation before public publication.
Reviews require a completed booking.
Hard deletion will be avoided when bookings or payments exist.
Recharts and advanced analytics are outside the MVP.
The backend is the authoritative source for pricing, availability, booking status, and payment status.


