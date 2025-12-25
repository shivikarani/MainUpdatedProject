# typingapp/admin.py
from django.contrib import admin
from .models import TestResult, DictionaryWord


# admin.site.site_header = "Typing Speed Test Website Admin"
# admin.site.site_title = "Typing Speed Test Website"
# admin.site.index_title = "Typing Speed Test Website - Logged in as admin (admin)"


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

@admin.register(VocabularyQuestion)
class VocabularyQuestionAdmin(admin.ModelAdmin):
    list_display = (
        'question_text',
        'question_type',
        'word',
        'correct_option'
    )
    list_filter = ('question_type',)
    search_fields = ('question_text', 'word__word')

admin.site.register(VocabularyTestResult)
admin.site.register(VocabularyAnswer)



list_display = ('user', 'level', 'wpm', 'accuracy')
readonly_fields = ('char_errors',)

