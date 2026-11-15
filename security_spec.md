# Firestore Security Specification

## 1. Data Invariants
1. **Admin Isolation**: Only the verified portfolio owner (`mdborhprodhan@gmail.com` with `email_verified == true`) or an explicitly registered `/admins/{uid}` record may mutate portfolio collections (`site_content`, `services`, `skills`, `projects`, `languages`, `social_links`, `media`) or read/update/delete `contact_messages`.
2. **PII Protection**: `contact_messages` contains visitor PII (`fullName`, `email`, `phone`, `message`). Public read, list, update, and delete access is unconditionally denied.
3. **Public Visibility Filtering**: Unauthenticated visitors can only read `published == true` projects and `visible == true` services, skills, languages, and social links.
4. **Schema Strictness & Size Bounds**: Every document enforces exact `hasAll` and `hasOnly` key allowlists, explicit type checks, bounded string lengths, and bounded list sizes (`<= 12`).
5. **Temporal Integrity**: All `createdAt`, `updatedAt`, `submittedAt`, and `uploadedAt` timestamps must equal `request.time` on creation/update, and `createdAt` / `submittedAt` are immutable after creation.
6. **Document ID Hardening**: All single-document operations enforce `^[a-zA-Z0-9_\-]+$` and length `<= 128`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Portfolio Defacement**: Anonymous `PATCH /site_content/main` attempting to overwrite `heroHeading` -> `PERMISSION_DENIED`.
2. **Unverified Email Admin Spoof**: Authenticated user with `email: "mdborhprodhan@gmail.com"` and `email_verified: false` attempting `CREATE /projects/p1` -> `PERMISSION_DENIED`.
3. **Self-Assigned Admin Escalation**: Authenticated non-admin user attempting `CREATE /admins/<uid>` with `role: "admin"` -> `PERMISSION_DENIED`.
4. **PII Scraping (`contact_messages` list)**: Unauthenticated or non-admin user attempting `LIST /contact_messages` -> `PERMISSION_DENIED`.
5. **PII Single-Doc Read**: Non-admin user attempting `GET /contact_messages/msg1` -> `PERMISSION_DENIED`.
6. **Shadow Ghost Field Injection**: Admin or visitor creating a `contact_messages` doc with extra field `isAdminApproved: true` -> `PERMISSION_DENIED` (blocked by `hasOnly`).
7. **Status Shortcutting on Contact Create**: Visitor creating `contact_messages` with `status: "Completed"` instead of `"New"` -> `PERMISSION_DENIED`.
8. **Client Timestamp Forgery**: Creating `contact_messages` with backdated `submittedAt` not equal to `request.time` -> `PERMISSION_DENIED`.
9. **Resource Exhaustion (1MB String Bomb)**: Submitting `message` with > 3000 characters or `projectId` > 128 characters -> `PERMISSION_DENIED`.
10. **ID Poisoning**: Document ID containing `../../etc/passwd` or spaces -> `PERMISSION_DENIED` (`isValidId`).
11. **Unpublished Draft Leak**: Unauthenticated user attempting `GET /projects/unpublished-draft` where `published == false` -> `PERMISSION_DENIED`.
12. **Immortal Timestamp Mutation**: Updating a `projects` document while modifying `createdAt` -> `PERMISSION_DENIED`.
