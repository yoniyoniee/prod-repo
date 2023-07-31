# JETFLIX 🚀

<div align="center">
	<img src="https://img.shields.io/badge/react-61DAFB?style=flat&logo=react&logoColor=black">
	<img src="https://img.shields.io/badge/Apache-D22128?style=flat&logo=Apache&logoColor=white" />
	<img src="https://img.shields.io/badge/apache tomcat-F8DC75?style=flat&logo=apachetomcat&logoColor=white">
	<img src="https://img.shields.io/badge/mysql-4479A1?style=flat&logo=mysql&logoColor=white">
</div>

<div align="center">
	
| <img src="https://user-images.githubusercontent.com/62248291/230932015-60db8c4e-4fdd-40d0-8ed1-f1d03ad1f509.png"/> | <img src="https://user-images.githubusercontent.com/62248291/230932467-066f6fc9-ecff-4a68-a5b4-2650c2b1511b.png"/> |
| ------------- | ------------- |
	
</div>

<div align="center"><실제 구현한 웹 모습></div>


### 넷플릭스 디자인의 OTT서비스를 3-Tier Architecture 온프레미스 환경으로 구현

<div align="left">
	
| ![3tier](https://user-images.githubusercontent.com/62248291/230931256-054ff059-b542-4e66-9698-fbf687c24a57.png) |
| ------------- |

</div>
	
프론트엔드 부분은 React를 통해서 구현하고 vmware를 통해 가상 네트워크 환경 속에 3-Tier Architecture를 구현
Web server는 아파치, WAS는 톰캣, DB는 mysql과 외부 스토리지를 만들어서 WAS와 NAS로 연결

### 프로젝트 진행하면서 발생하는 이슈 정리
- 로컬호스트에서 react로 웹을 구현하고 npm start 하였을 때에는 기능 동작에 아무런 문제가 없었지만, vmware 아파치 웹서버에 배포하고 접속하였을 시 메인 페이지는 동작이 잘되었지만 다른 페이지에서 404 에러가 발생
##### 원인) react는 client-side에서 랜더링을 하고 apache는 server-side에서 랜더링을 하는 방식이다
- react는 로드하는 데 필요한 스크립트 태그가 포함된 html 페이지가 반환된 후, 필요한 스크립트 파일을 클라이언트 측에서 로드한다. 하지만 apache는 서버에서 랜더링을 하고 클라이언트 쪽으로 페이지를 반환해준다. 나의 경우에는 apache 서버 쪽에 있지도 않은 http://<hi1><hi2>web.server/search를 계속 요청했기 때문에 404에러가 발생한 것이다.
#### 해결방안
서버에 들어오는 요청을 재작성하여 index.html로 바꾸는 것이다.
1. /etc/httpd/conf/httpd.conf 파일에
```
<Directory "/var/www/html">
    	Options -MultiViews
    	RewriteEngine On
    	RewriteCond %{REQUEST_FILENAME} !-f
    	RewriteRule ^ index.html [QSA,L]
    	Require all granted
</Directory> 
```
이런 식으로 설정을 한다.

2. /etc/httpd/conf/httpd.conf 파일에
```
<IfModule>
	LoadModule rewrite_module modules/mod_rewrite.so
</IfModule>
```
을 추가한다.

### 원인을 찾기 위해서 디버깅을 하면서 코드의 가독성에 대한 중요성을 느꼈다, 리팩토링 시작
