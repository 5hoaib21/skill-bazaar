You are working inside an existing Git repository that currently contains an old application.

The repository root contains a file named:

`PRD.md`

The existing application is now obsolete.

Your task is to read `PRD.md` completely and rebuild the entire application according to that document.

Treat `PRD.md` as the single source of truth for:

* Project concept
* Features
* Technology stack
* Frontend requirements
* Backend requirements
* Database structure
* Authentication
* Authorization
* API design
* Routes
* UI/UX
* Responsiveness
* Dashboard
* Charts
* Validation
* Security
* Documentation
* Final verification

Do not ask me to paste the PRD into the chat. Read it directly from the repository.

Do not ask follow-up questions unless completing the task is genuinely impossible because of missing external credentials or services.

Make reasonable technical decisions whenever the PRD leaves a minor implementation detail unspecified.

# Primary Objective

Completely transform the existing application into the application described in `PRD.md`.

The current project implementation, design, components, routes, API structure, database logic, and old business concept may be removed or replaced as necessary.

Do not preserve old functionality merely because it already exists.

However, preserve anything that is still technically useful and fully compatible with `PRD.md`, such as:

* Working TypeScript configuration
* Reusable utility functions
* Valid authentication setup
* Useful Tailwind configuration
* Correct MongoDB connection utilities
* Generic reusable UI components
* Existing environment-variable structure

Do not rebuild compatible infrastructure unnecessarily, but do not allow old project requirements to override `PRD.md`.

# Critical Files That Must Be Preserved

Never delete or damage:

* `.git`
* `.gitignore`
* `PRD.md`
* Git repository history
* Git remote configuration
* Valid environment files already present
* Existing GitHub connection

Do not expose, print, commit, or push secret values from `.env` files.

Ensure `.env` and other secret files remain ignored by Git.

You may update `.env.example` files using variable names only, without real secrets.

# Mandatory Restrictions

Follow every restriction stated in `PRD.md`.

Additionally:

* Do not add payment functionality
* Do not add Stripe
* Do not add subscriptions
* Do not add checkout
* Do not add billing
* Do not add transactions
* Do not add donations
* Do not use Mongoose
* Use MongoDB Native Driver
* Use TypeScript throughout the frontend and backend
* Do not leave unfinished placeholder functionality
* Do not use Lorem Ipsum
* Do not create non-functional buttons or links
* Do not use hardcoded fake dashboard statistics when database-generated data is required

# Phase 1: Repository and Git Preflight

Before modifying application code:

1. Read `PRD.md` completely.
2. Inspect the entire repository structure.
3. Inspect frontend and backend package files.
4. Inspect the current Git status.
5. Determine the current branch.
6. Inspect configured Git remotes.
7. Inspect recent Git history.
8. Identify existing uncommitted changes.
9. Identify which existing files can be reused.
10. Identify which old files must be replaced or removed.
11. Identify current environment-variable requirements without displaying secret values.
12. Identify the package manager currently used by the repository.

Run appropriate commands such as:

```bash
git status
git branch --show-current
git remote -v
git log --oneline -10
```

Do not use destructive commands during this inspection.

# Phase 2: Protect Existing Work

Before rebuilding the project, protect the current repository state.

Use this Git workflow:

1. Store the current branch name as the base branch.
2. If there are uncommitted changes, inspect them.
3. Commit legitimate existing changes using:

```txt
chore: checkpoint before PRD rebuild
```

4. Push the checkpoint to the current remote branch.
5. Create a backup branch from the current state using a name similar to:

```txt
backup/pre-prd-rebuild
```

6. Push the backup branch to `origin`.
7. Create a new working branch named:

```txt
feat/volunteerconnect-prd-rebuild
```

If that branch already exists, use a safe unique variation instead of deleting or overwriting it.

Never:

* Delete the Git repository
* Delete Git history
* Force-push
* Use `git reset --hard`
* Rewrite published history
* Delete the remote repository
* Delete the base branch
* Push secrets
* Commit `.env` files
* Bypass branch protection
* Resolve a Git conflict by discarding unknown user work

# Phase 3: Create an Implementation Plan

After reading the PRD and auditing the repository, create:

```txt
IMPLEMENTATION_PLAN.md
```

The implementation plan must contain:

* Current repository assessment
* Target architecture
* Frontend structure
* Backend structure
* Database collections
* Authentication flow
* JWT flow
* Authorization rules
* Public routes
* Protected routes
* API endpoints
* Dashboard requirements
* UI system
* Responsive strategy
* Validation strategy
* Security strategy
* Seed-data strategy
* Testing and verification strategy
* Ordered implementation milestones
* Requirement checklist mapped back to `PRD.md`

Use a task list and update it as work progresses.

Do not stop after writing the plan. Continue implementing the project.

# Phase 4: Rebuild Strategy

Implement the project milestone by milestone.

After every milestone:

1. Review the changed files.
2. Run the relevant type checking.
3. Run relevant linting.
4. Run relevant tests if tests exist.
5. Fix errors caused by the milestone.
6. Check `git diff`.
7. Stage only relevant files.
8. Create one meaningful Git commit.
9. Push the commit to the working branch.
10. Update `IMPLEMENTATION_PLAN.md` with progress.
11. Continue automatically to the next milestone.

Do not create a commit when the code is in an obviously broken or incomplete state.

Do not combine the entire project into one giant commit.

Use Conventional Commit messages.

# Required Git Commit Sequence

Use a logical commit sequence similar to the following, adapting it when the repository structure requires it.

## Milestone 1: Project Foundation

Complete:

* Remove obsolete application-specific code
* Establish final frontend and backend architecture
* Configure TypeScript
* Configure Tailwind CSS
* Configure linting
* Configure reusable project utilities
* Configure MongoDB Native Driver
* Configure environment examples
* Establish shared types and validation structure

Commit:

```txt
chore: rebuild project foundation from PRD
```

Then push.

## Milestone 2: Authentication and Security

Complete:

* Better Auth integration
* Login
* Registration
* Logout
* Session persistence
* Demo login
* Callback URL support
* JWT integration for Express APIs
* Authentication middleware
* Protected-route handling
* Server-side user identity
* Secure authorization foundation

Commit:

```txt
feat: implement authentication and protected API security
```

Then push.

## Milestone 3: Opportunities Backend

Complete:

* Opportunity types
* Opportunity validation
* MongoDB collection access
* Create opportunity API
* List opportunities API
* Opportunity details API
* Current-user opportunities API
* Delete opportunity API
* Search
* Filtering
* Sorting
* Pagination
* Ownership authorization
* Database indexes

Commit:

```txt
feat: implement volunteer opportunity APIs
```

Then push.

## Milestone 4: Opportunities Frontend

Complete:

* Opportunity cards
* Equal card sizing
* Skeleton loaders
* Explore page
* Search interface
* Filters
* Sorting
* Pagination
* URL search parameters
* Details page
* Image gallery
* Related opportunities
* Add opportunity page
* Manage opportunities page
* Responsive desktop and mobile layouts

Commit:

```txt
feat: build opportunity discovery and management pages
```

Then push.

## Milestone 5: Volunteer Applications

Complete:

* Application types
* Application validation
* Application submission
* Duplicate prevention
* Own-opportunity prevention
* Deadline validation
* My Applications page
* Received Applications page
* Approve action
* Reject action
* Withdraw action
* Complete action
* Server-side status-transition validation
* Organizer ownership checks

Commit:

```txt
feat: implement volunteer application workflow
```

Then push.

## Milestone 6: Dashboard and Recharts

Complete:

* Dashboard summary API
* MongoDB aggregation
* Monthly application data
* Application-status distribution
* Category distribution
* Completed-activity statistics
* Responsive Recharts components
* Database-generated summary cards
* Loading, empty, and error states

Commit:

```txt
feat: add organizer dashboard and analytics
```

Then push.

## Milestone 7: Landing Page and Public Pages

Complete every meaningful landing-page section required by `PRD.md`, including:

* Navbar
* Hero
* Featured opportunities
* Categories
* How it works
* Urgent opportunities
* Community statistics
* Featured organizers
* Testimonials
* Articles
* FAQ
* CTA
* Footer

Also complete:

* About
* Contact
* Blogs
* Help
* Privacy
* Terms

Ensure every route, link, form, button, and CTA works.

Commit:

```txt
feat: complete landing page and public content
```

Then push.

## Milestone 8: Seed Data and Content Quality

Complete:

* Meaningful seed script
* Realistic volunteer opportunity content
* Relative future dates where required
* Multiple categories
* Valid images or image URLs
* Complete descriptions
* Skills
* Responsibilities
* Benefits
* Organizations
* Locations

Do not use Lorem Ipsum or repeated placeholder content.

Commit:

```txt
feat: add realistic volunteer opportunity seed data
```

Then push.

## Milestone 9: UX, Responsiveness, and Accessibility

Review and improve:

* Mobile layout
* Tablet layout
* Desktop layout
* Four cards per row on desktop
* Consistent card dimensions
* Keyboard accessibility
* Semantic HTML
* Form labels
* Error messages
* Loading skeletons
* Empty states
* Toasts
* Confirmation dialogs
* Disabled states
* Focus states
* Navigation usability
* Image optimization
* Broken links
* Non-functional controls

Commit:

```txt
fix: polish responsiveness accessibility and user experience
```

Then push.

## Milestone 10: Documentation and Final Quality

Complete:

* Professional README
* Environment-variable documentation
* Installation instructions
* Frontend commands
* Backend commands
* Authentication explanation
* Authorization explanation
* API endpoint documentation
* MongoDB collection documentation
* Demo credentials
* Scripts
* Repository placeholders
* Live-site placeholder
* PRD requirement checklist

Commit:

```txt
docs: complete project documentation and setup guide
```

Then push.

# Code Quality Requirements

Maintain clean architecture.

Frontend should use appropriate reusable folders such as:

```txt
app
components
features
hooks
lib
services
types
utils
providers
```

Backend should use appropriate folders such as:

```txt
src/config
src/controllers
src/middlewares
src/routes
src/services
src/types
src/utils
src/validators
```

Requirements:

* Avoid unnecessary `any`
* Avoid duplicate types
* Avoid huge components
* Avoid repeated API logic
* Avoid repeated UI
* Keep controllers thin
* Keep business logic in services
* Keep validation reusable
* Use proper TypeScript return types
* Handle expected errors
* Use consistent API responses
* Validate MongoDB ObjectIds
* Enforce authorization on the backend
* Never trust ownership IDs sent by the browser
* Never expose stack traces in production
* Never expose environment secrets

# Testing and Verification

After implementation, perform a complete verification pass.

Run the correct commands for the package manager and project structure, including applicable versions of:

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

If the project uses separate frontend and backend directories, verify both independently.

Verify at minimum:

* Frontend TypeScript compilation
* Backend TypeScript compilation
* ESLint
* Production frontend build
* Production backend build
* Authentication
* Registration
* Login
* Logout
* Demo login
* Session persistence
* Protected-route redirects
* JWT verification
* Opportunity creation
* Opportunity listing
* Opportunity details
* Opportunity deletion
* Ownership authorization
* Searching
* Filtering
* Sorting
* Pagination
* Application creation
* Duplicate-application prevention
* Own-opportunity application prevention
* Deadline validation
* Application approval
* Application rejection
* Application withdrawal
* Application completion
* Dashboard aggregation
* Contact form
* Responsive navigation
* Mobile layout
* Tablet layout
* Desktop layout
* Four-card desktop grid
* Loading states
* Empty states
* Error states
* Working links
* Working buttons

Search the repository for forbidden or obsolete references, including:

```txt
Stripe
payment
checkout
subscription
billing
transaction
donation
Mongoose
mongoose
Lorem ipsum
TODO
FIXME
```

Remove inappropriate remaining references unless they are intentionally included in documentation explaining that the project does not use them.

# Dependency Cleanup

Review all dependencies.

Remove packages that are no longer used by the rebuilt project.

Do not remove a dependency until its imports and usage have been safely removed.

Ensure:

* Mongoose is not installed
* Payment packages are not installed
* Unused UI packages are removed
* TypeScript dependencies are correct
* Frontend dependencies are in the frontend package
* Backend dependencies are in the backend package
* Lockfiles remain consistent

# Git Rules During Implementation

Before every commit:

```bash
git status
git diff
```

Commit only project-related files.

Never commit:

* `.env`
* Secret keys
* Access tokens
* Private credentials
* Build output
* Dependency directories
* Temporary logs
* Editor-specific secret files

After every successful commit, push using the existing `origin` remote and the working branch.

If a push fails because of authentication, network access, remote rejection, or branch protection:

1. Do not repeatedly retry indefinitely.
2. Preserve all local commits.
3. Continue implementation when safe.
4. Report the exact failed command and concise error at the end.
5. Do not force-push.
6. Do not delete or recreate the repository.

# Final Review Commit

After all milestones are complete:

1. Compare the completed application line by line against `PRD.md`.
2. Update the PRD checklist in `IMPLEMENTATION_PLAN.md`.
3. Fix missing requirements.
4. Run all available validation commands.
5. Review `git status`.
6. Ensure the working tree is clean.
7. Create a final commit only if verification fixes were required.

Use:

```txt
fix: resolve final PRD compliance issues
```

Push the final commit to the working branch.

# Merge Back to the Original Branch

Only after all required builds and checks pass:

1. Remember the original base branch.
2. Make sure all working-branch commits are pushed.
3. Switch to the original base branch.
4. Pull the latest remote changes safely.
5. Merge the working branch using a normal non-destructive merge.
6. Preserve the milestone commit history.
7. Push the updated base branch to `origin`.

A suitable merge commit message is:

```txt
feat: rebuild application according to VolunteerConnect PRD
```

Do not merge automatically when:

* Tests or builds are failing because of project code
* The remote base branch changed in a conflicting way
* A merge conflict contains unknown user work
* Branch protection prevents the merge
* Authentication fails

In those situations, leave the complete implementation safely pushed on the working branch and report the exact blocker.

Never force-push the base branch.

# Completion Conditions

Do not declare completion merely because files were generated.

The task is complete only when:

* `PRD.md` has been fully implemented
* The obsolete application has been replaced
* Frontend and backend are functional
* Authentication is implemented
* Authorization is enforced server-side
* MongoDB Native Driver is used
* Mongoose is absent
* Payment functionality is absent
* Search works
* Filtering works
* Sorting works
* Pagination works
* Application workflow works
* Dashboard charts use database-generated data
* Required pages exist
* Required sections exist
* UI is responsive
* Links work
* Buttons work
* Validation exists on frontend and backend
* Documentation is complete
* Type checking passes
* Linting passes
* Production builds pass
* Milestone commits exist
* Commits have been pushed, or an exact external Git blocker has been reported
* The final Git working tree is clean

# Final Response

When finished, provide a concise report containing:

1. Project implementation summary
2. PRD requirements completed
3. Final frontend architecture
4. Final backend architecture
5. MongoDB collections
6. Important API endpoints
7. Authentication and authorization flow
8. Created files
9. Major modified files
10. Removed obsolete files
11. Installed dependencies
12. Removed dependencies
13. Environment variables required
14. Seed command
15. Development commands
16. Build commands
17. Test, lint, typecheck, and build results
18. Git branches created
19. Git commits created
20. Push results
21. Whether the working branch was merged into the base branch
22. Any external configuration still required
23. Any unresolved issue with its exact cause

Begin now by reading `PRD.md`, inspecting the repository, and checking Git status.

Do not stop after planning.

Continue through implementation, verification, commits, pushes, and final reporting.
