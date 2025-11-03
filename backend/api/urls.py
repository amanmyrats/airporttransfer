from django.urls import path, include


urlpatterns = [
    path('v1/accounts/', include('accounts.urls')),
    path('v1/common/', include('common.urls')),
    path('v1/transfer/', include('transfer.urls')),
    path('v1/blogs/', include('blog.urls')),
    path('v1/payments/', include('payment.urls')),
    path('v1/', include(('reviews.urls', 'reviews'), namespace='reviews')),
]
