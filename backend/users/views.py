from django import http
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import View
from django.utils.datastructures import MultiValueDict
import json

@method_decorator(ensure_csrf_cookie, 'dispatch')
class UserView(View):
    # This is the validation check
    def get(self, request):
        if not request.user.is_authenticated:
          return http.HttpResponseForbidden()
        return http.JsonResponse({
          id: request.user.pk,
          username: request.user.get_username(),
        })
    # This is the login
    def post(self, request):
        
        data = json.loads(request.body.decode())
        
        d = MultiValueDict({'username': [data["username"]], 
                            'password': [data["password"]]})
        
        form = AuthenticationForm(request, data=d)
        
        if form.is_valid():
            print("form is valid")
            login(request, form.get_user())
            return self.get(request)
        
        return http.JsonResponse(form.data, status=403)
    # This is the logout
    def delete(self, request):
        logout(request)
        return http.HttpResponse(status=205)  # Reset Content