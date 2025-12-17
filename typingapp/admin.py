# typingapp/admin.py
from django.contrib import admin
from .models import TestResult, DictionaryWord

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user','created_at','wpm','accuracy','duration_seconds','level')
    # search_fields = ('user__username','session_id','source_text')




@admin.register(DictionaryWord)
class DictionaryWordAdmin(admin.ModelAdmin):
    list_display = ('word',)
    search_fields = ('word', 'meaning')



from .models import (
    DictionaryWord,
    VocabularyQuestion,
    VocabularyTestResult,
    VocabularyAnswer
)

admin.site.register(VocabularyQuestion)
admin.site.register(VocabularyTestResult)
admin.site.register(VocabularyAnswer)


