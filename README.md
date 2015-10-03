# calendar-app
Course Assignments for Mobile Cloud Computing

Juho Salmio 217259

Vivien Letonnellier


# Local Development

Install mongodb from https://www.mongodb.org/downloads#production and run it in the background.

Install nodejs from https://nodejs.org/en/download/ (Requires atleast version 4)

```
git clone https://github.com/Dolmio/calendar-app.git
cd calendar-app
npm install
npm start
Profit!
```

Server has to be restarted after changing server code.

# Deploy

We deploy our application to the cloud using git.
After the push to the server post-receive commit hook restarts the server.



Add remote (do only once) 
```
git remote add production ssh://openstack-instance:/~/calendar-app.git
```

The previous assumes that you have openstack-instance configured to your .ssh/config

Example-config:
```
Host openstack-echo
	HostName echo.niksula.hut.fi
	User USERNAME
Host openstack-instance
	ProxyCommand ssh openstack-echo -W %h:%p
	User INSTANCE-USERNAME
	HostName 130.233.42.239
```

You should also configure your ssh-keys to have passwordless access to both openstack-echo and instance.

When you want to deploy do:
```
git push production master
```









