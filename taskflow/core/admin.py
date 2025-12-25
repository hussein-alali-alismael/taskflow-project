from django.contrib import admin
from .models import Member, Team, Task, TeamMember, TeamMemberTask

# Register the models in admin dashboard

admin.site.register(Member)
admin.site.register(Team)
admin.site.register(Task)
admin.site.register(TeamMember)
admin.site.register(TeamMemberTask)
