from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('typing-test/', views.typing_test_page, name='typing_test'),
    path('save-result/', views.save_result, name='save_result'),
    path('history/', views.history, name='history'),
    # password reset using built-ins:
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name='typingapp/password_reset_form.html'), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='typingapp/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='typingapp/password_reset_confirm.html'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='typingapp/password_reset_complete.html'), name='password_reset_complete'),
    path('dictionary/', views.dictionary_view, name='dictionary'),
    path('vocabulary-test/', views.vocabulary_test, name='vocabulary_test'),
    path('vocabulary-submit/', views.vocab_submit, name='vocab_submit'),
    path('vocabulary-result/<int:result_id>/', views.vocab_result, name='vocab_result'),
    path('vocabulary-history/', views.vocab_history, name='vocab_history'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('about/', views.about, name='about'),   # About page
    path('contact/', views.contact, name='contact'),



]
