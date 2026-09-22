from rest_framework.routers import DefaultRouter

from orders.views import ContactMessageViewSet, OrderViewSet

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")
router.register("contact", ContactMessageViewSet, basename="contact")

urlpatterns = router.urls
