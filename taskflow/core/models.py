"""Django ORM models for Taskflow.

This module defines the core domain entities:
- `Member`: a user account identified by a unique `username` and a display
  `name` used in the UI.
- `Team`: a named team that groups members and tasks.
- `Task`: a reusable task definition (name only).
- `TeamMember`: a relation tying a `Member` to a `Team` with an `is_admin`
  flag indicating whether the member has administrative privileges for the
  team.
- `TeamMemberTask`: assignment of a `Task` to a `TeamMember` with start/end
  dates and completion state.

These classes keep the schema intentionally small and explicit to make the
application logic easy to reason about. Unique constraints and foreign keys
express the domain invariants (e.g. `username` must be unique).
"""

from django.db import models


class Member(models.Model):
    """A user account in the system.

    Fields:
        username (str): unique identifier used for authentication and
            session identity.
        name (str): human-friendly display name shown in the UI (not unique).
        gmail (str): contact email address.
        password (str): stored password (plain-text in this demo; replace with
            a hashed password implementation for production).
    """

    username = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    gmail = models.EmailField()
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Team(models.Model):
    """A group or workspace that contains members and tasks.

    The `name` field is a human-friendly identifier; multiple teams may share
    similar names but are distinct records in the DB.
    """

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Task(models.Model):
    """A reusable task template stored by name.

    Tasks are lightweight and are associated with `TeamMemberTask` when
    assigned to a team member.
    """

    name_task = models.CharField(max_length=255)

    def __str__(self):
        return self.name_task


class TeamMember(models.Model):
    """Represents a Member's membership in a Team.

    The `is_admin` flag denotes whether the member has administrative
    permissions for the team (able to add/edit/remove members and tasks).
    """

    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.member.name} in {self.team.name}"


class TeamMemberTask(models.Model):
    """An assignment of a `Task` to a `TeamMember`.

    Fields include `start_date`, `end_date` and `is_finish` to track progress.
    """

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    team_member = models.ForeignKey(TeamMember, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    is_finish = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.task.name_task} - {self.team_member.member.name}"
