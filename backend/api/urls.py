from django.urls import path, include


urlpatterns = [
    path('v1/accounts/', include('accounts.urls')),
    path('v1/common/', include('common.urls')),
    path('v1/transfer/', include('transfer.urls')),
    path('v1/me/', include(('transfer.urls_me', 'transfer_me'), namespace='transfer_me')),
    path('v1/admin/', include(('transfer.urls_admin', 'transfer_admin'), namespace='transfer_admin')),
    path('v1/blogs/', include('blog.urls')),
    path('v1/payments/', include('payment.urls')),
    path('v1/', include(('reviews.urls', 'reviews'), namespace='reviews')),
]
