# Guestbook

A single-context mini guestbook: anyone can leave an entry and later change or remove it by proving they wrote it, without any account system.

## Language

**Entry**:
A single guestbook submission: an author name, a message, a posting time, and a password that authorizes later changes to it.
_Avoid_: Post, comment, record (as the whole-item name)

**Author name**:
The display name attached to an entry. It is freeform, not unique, and identifies no one — two entries can share the same author name with no relationship implied.
_Avoid_: Username, user, poster

**Message**:
The free-text body of an entry. It is the only field that can change after the entry is created.
_Avoid_: Content, body, text

**Entry password**:
A secret chosen when an entry is created, used solely to authorize editing or deleting that one entry later. It proves "I wrote this," not "I am someone" — it is not a login credential and grants no access beyond that single entry.
_Avoid_: Login password, account password, credential

**Verification**:
The check, performed when editing or deleting an entry, that the supplied password matches the one chosen when that entry was created. Verification either passes or is rejected; a rejection never distinguishes "wrong password" from "this entry is gone" to the visitor.
_Avoid_: Authentication, login

**Posting time**:
The moment an entry was created. It is fixed for the entry's lifetime and is what the list is ordered by (newest first) — editing a message never changes its posting time or its place in the list.
_Avoid_: Timestamp, last modified, updated time
