FROM php:8.2-apache

# تفعيل mod_rewrite لدعم الروابط
RUN a2enmod rewrite

# نسخ ملفات لوحة التحكم إلى مسار السيرفر
COPY . /var/www/html/

# إعداد الصلاحيات
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html

# المنفذ الافتراضي
EXPOSE 80

CMD ["apache2-foreground"]
