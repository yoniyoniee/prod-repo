FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y apache2
RUN sudo update-rc.d apache2 enable
RUN sudo service apache2 start
HEALTHCHECK CMD service apache2 status || exit 1
COPY build/ /var/www/html/
EXPOSE 80
CMD ["apache2ctl", "-D", "FOREGROUND"]
