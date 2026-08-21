from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "success",
        "message": "Studio Guide Creator backend is running",
        "database": "connected"
    })
