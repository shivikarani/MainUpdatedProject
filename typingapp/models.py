# typingapp/models.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class TestResult(models.Model):
    LEVEL_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=128, blank=True, null=True)  # for anonymous users
    created_at = models.DateTimeField(auto_now_add=True)
    duration_seconds = models.IntegerField()   # e.g., 120, 300
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    source_text = models.TextField()    # the text shown to user
    typed_text = models.TextField()     # what user typed
    correct_chars = models.IntegerField()
    total_typed_chars = models.IntegerField()
    errors = models.IntegerField()
    wpm = models.FloatField()           # words per minute
    accuracy = models.FloatField()  
    char_errors = models.JSONField(default=dict)    # percentage

    # def __str__(self):
    #     who = self.user.username if self.user else f"anon:{self.session_id}"
    #     return f"{who} - {self.created_at:%Y-%m-%d %H:%M} - {self.wpm:.1f} WPM"
    def __str__(self):
        return f"{self.user} - {self.level} - {self.wpm} WPM"
    
class DictionaryWord(models.Model):
    word = models.CharField(max_length=100, unique=True)
    meaning = models.TextField()
    synonyms = models.TextField(help_text="Comma separated")
    antonyms = models.TextField(help_text="Comma separated")
    sentence1 = models.TextField()
    sentence2 = models.TextField()
    sentence3 = models.TextField()

    def __str__(self):
        return self.word


class VocabularyQuestion(models.Model):
    word = models.ForeignKey(DictionaryWord, on_delete=models.CASCADE)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(
        max_length=1,
        choices=[('A','A'),('B','B'),('C','C'),('D','D')]
    )

    def __str__(self):
        return self.word.word


class VocabularyTestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField()
    total_questions = models.IntegerField(default=20)
    correct = models.IntegerField()
    wrong = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class VocabularyAnswer(models.Model):
    result = models.ForeignKey(VocabularyTestResult, on_delete=models.CASCADE)
    question = models.ForeignKey(VocabularyQuestion, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1)
