# typingapp/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignupForm
from .models import TestResult
from django.http import JsonResponse, HttpResponseBadRequest
import json
from django.views.decorators.csrf import csrf_exempt

from .models import VocabularyQuestion, VocabularyTestResult, VocabularyAnswer


from .models import DictionaryWord
import random
from django.db.models import Max

def home(request):
    words = list(DictionaryWord.objects.all())
    random.shuffle(words)
    carousel_words = words[:10]  # 10 words carousel me

    return render(request, 'typingapp/home.html', {
        'carousel_words': carousel_words
    })


def signup_view(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = SignupForm()
    return render(request, 'typingapp/signup.html', {'form': form})

def login_view(request):  # you can use builtin auth views too
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'typingapp/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

# def typing_test_page(request):
#     # choose a source text by level (you can load from DB or static file)
#     # we'll supply JS with some sample texts by level
#     return render(request, 'typingapp/typing_test.html')
@login_required(login_url='login')  # this will redirect to login if not authenticated
def typing_test_page(request):
    return render(request, 'typingapp/typing_test.html')

@login_required
def history(request):
    results = TestResult.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'typingapp/history.html', {'results': results})

@login_required  # if using AJAX fetch with csrf token, you can remove this and use CSRF
def save_result(request):
    # Expect JSON with: duration_seconds, level, source_text, typed_text, correct_chars, total_typed_chars, errors, wpm, accuracy
    if request.method != 'POST':
        return HttpResponseBadRequest('POST required')
    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')
    # Minimal validation
    required = ['duration_seconds','level','source_text','typed_text','correct_chars','total_typed_chars','errors','wpm','accuracy']
    if not all(k in data for k in required):
        return HttpResponseBadRequest('Missing fields')
    user = request.user if request.user.is_authenticated else None
    session_id = session_id = request.session.session_key or request.session.cycle_key()
    # if not user:
    #     session_id = request.session.session_key or request.session.cycle_key()
    tr = TestResult.objects.create(
        user=user,
        session_id=session_id,
        duration_seconds=int(data['duration_seconds']),
        level=data['level'],
        source_text=data['source_text'],
        typed_text=data['typed_text'],
        correct_chars=int(data['correct_chars']),
        total_typed_chars=int(data['total_typed_chars']),
        errors=int(data['errors']),
        wpm=float(data['wpm']),
        accuracy=float(data['accuracy']),
    )
    return JsonResponse({'status':'ok','id': tr.id})


from .models import DictionaryWord
from django.core.paginator import Paginator

def dictionary_view(request):
    query = request.GET.get('q', '')
    words = DictionaryWord.objects.all()

    if query:
        words = words.filter(word__icontains=query)

    paginator = Paginator(words, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'typingapp/dictionary.html', {
        'page_obj': page_obj,
        'query': query
    })


@login_required
def vocabulary_test(request):
    all_ids = list(VocabularyQuestion.objects.values_list('id', flat=True))

    if not all_ids:
        return render(request, 'typingapp/vocab_test.html', {
            'questions': [],
            'error': 'No vocabulary questions available. Please add questions in admin.'
        })

    used_ids = request.session.get('used_vocab_questions', [])

    # remove already used
    available_ids = list(set(all_ids) - set(used_ids))

    # agar sab use ho gaye → reset
    if not available_ids:
        available_ids = all_ids
        used_ids = []

    # ⭐ SAFE COUNT
    count = min(20, len(available_ids))

    selected_ids = random.sample(available_ids, count)

    request.session['used_vocab_questions'] = used_ids + selected_ids
    request.session['vocab_qids'] = selected_ids

    questions = VocabularyQuestion.objects.filter(id__in=selected_ids)

    return render(request, 'typingapp/vocab_test.html', {
        'questions': questions
    })


# @login_required
# def vocabulary_test(request):
#     questions = list(VocabularyQuestion.objects.order_by('?')[:20])
#     request.session['vocab_qids'] = [q.id for q in questions]
#     return render(request, 'typingapp/vocab_test.html', {'questions': questions})


# @login_required
# def vocab_submit(request):
#     if request.method != 'POST':
#         return redirect('vocabulary_test')

#     qids = request.session.get('vocab_qids', [])
#     questions = VocabularyQuestion.objects.filter(id__in=qids)

#     correct = 0
#     wrong = 0
#     result = VocabularyTestResult.objects.create(
#         user=request.user,
#         score=0,
#         total_questions=len(questions),
#         correct=0,
#         wrong=0
#     )

#     for q in questions:
#         selected = request.POST.get(str(q.id))
#         if selected == q.correct_option:
#             correct += 1
#         else:
#             wrong += 1

#         VocabularyAnswer.objects.create(
#             result=result,
#             question=q,
#             selected_option=selected
#         )

#     result.correct = correct
#     result.wrong = wrong
#     result.score = correct
#     result.save()

#     return redirect('vocab_result', result.id)
@login_required
def vocab_submit(request):
    if request.method != 'POST':
        return redirect('vocabulary_test')

    qids = request.session.get('vocab_qids')

    if not qids:
        return redirect('vocabulary_test')

    questions = VocabularyQuestion.objects.filter(id__in=qids)

    correct = 0
    wrong = 0

    result = VocabularyTestResult.objects.create(
        user=request.user,
        score=0,
        total_questions=len(questions),
        correct=0,
        wrong=0
    )

    for q in questions:
        selected = request.POST.get(str(q.id))

        if selected == q.correct_option:
            correct += 1
        else:
            wrong += 1

        VocabularyAnswer.objects.create(
            result=result,
            question=q,
            selected_option=selected
        )

    result.correct = correct
    result.wrong = wrong
    result.score = correct
    result.save()

    return redirect('vocab_result', result_id=result.id)



@login_required
def vocab_result(request, result_id):
    result = VocabularyTestResult.objects.get(id=result_id, user=request.user)
    answers = VocabularyAnswer.objects.select_related('question').filter(result=result)
    return render(request, 'typingapp/vocab_result.html', {
        'result': result,
        'answers': answers
    })


@login_required
def vocab_history(request):
    results = VocabularyTestResult.objects.filter(user=request.user)
    return render(request, 'typingapp/vocab_history.html', {'results': results})


@login_required
def leaderboard(request):
    top_results = TestResult.objects.filter(user__isnull=False)\
                    .order_by('-wpm')[:10]
    return render(request, 'typingapp/leaderboard.html', {
        'results': top_results
    })




def about(request):
    return render(request,"about.html")

def contact(request):
    return render(request,"contact.html")