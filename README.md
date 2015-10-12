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

# API Documentation

**Show Event**
----
  Returns json data about a single event.

* **URL**

  /event/:id

* **Method:**

  `GET`

*  **URL Params**

   **Required:**

   `id=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
                      "description": "Sample description6",
                      "location": "Espoo3",
                      "startTime": "2015-02-08 09:30",
                      "endTime": "2015-02-08 10:30",
                      "attendees: ["example@gmail.com"]
                      "_id": "5613c934b03343196a0b1893"
                  }`

* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:**

  OR

  * **Code:** 500 Internal Server error <br />
    **Content:** `{
                      "message": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
                  }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/event/55fd62238e2800ca0b2988da",
      dataType: "json",
      type : "GET",
      success : function(r) {
        console.log(r);
      }
    });
  ```
**Show Events**
----
  Returns json data about all the elements. The result set can also be filtered with searchQuery parameter.

* **URL**

  /event/

* **Method:**

  `GET`

*  **URL Params**

   **Optional:**

   `searchQuery=[string | ISO 8601 string]`


* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
    {
                          "description": "Event in Espoo",
                          "location": "Espoo",
                          "startTime": "2015-02-08 09:30",
                          "endTime": "2015-02-08 10:30",
                          "_id": "5613c934b03343196a0b1893"
    }
    ,{
                          "description": "Another event in Espoo",
                          "location": "Espoo",
                          "startTime": "2015-02-08 09:30",
                          "endTime": "2015-02-08 10:30",
                          "_id": "5613c934b03343196a0b1894"

    }]`


* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/event/?active=2015-02-08T10:30",
      dataType: "json",
      type : "GET",
      success : function(r) {
        console.log(r);
      }
    });
  ```

**Delete Event**
----
  Deletes event with the id given in URL

* **URL**

  /event/:id

* **Method:**

  `DELETE`

*  **URL Params**

   **Required:**

   `id=[string]`


* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
                      "ok": 1,
                      "n": 1
                  }`

* **Error Response:**

  * **Code:** 404 If event with the given id was not found <br />
    **Content:**

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/event/5613c934b03343196a0b1894",
      dataType: "json",
      type : "DELETE",
      success : function(r) {
        console.log(r);
      }
    });
  ```

**Create Event**
----
    Creates new event to the calendar.

* **URL**

  /event/

* **Method:**

  `POST`

*  **URL Params**

-

* **Data Params**
    **Required:**

    `description=[string]`
    `startTime=[ISO 8601 string]`
    `endTime=[ISO 8601 string]`


    **Optional:**

    `location=[string]`
    `attendees=[array[email]]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
                                        "description": "Sample description6",
                                        "location": "Espoo3",
                                        "startTime": "2015-02-08 09:30",
                                        "endTime": "2015-02-08 10:30",
                                        "attendees: ["example@gmail.com"],
                                        "_id": "5613c934b03343196a0b1893"
                                    }`


* **Error Response:**
  * **Code:** 400 Bad Request <br />
    **Content:** `{
                      "description": [
                          "Description can't be blank"
                      ]
                  }`

 * **Code:** 400 Bad Request <br />
     **Content:** `{
                       "startTime": [
                           "Start time 2015-02-08 09:30 must be smaller than 2015-02-08 08:30"
                       ]
                   }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/event/",
      dataType: "json",
      type : "POST",
      data: JSON.stringify({
                                                                   "description": "Sample description6",
                                                                   "location": "Espoo3",
                                                                   "startTime": "2015-02-08 09:30",
                                                                   "endTime": "2015-02-08 10:30",
                                                                   "attendees: ["example@gmail.com"],
                                                                   "_id": "5613c934b03343196a0b1893"
                                                               })
      success : function(r) {
        console.log(r);
      }
    });
  ```

**Create Event**
----
    Creates new event to the calendar.

* **URL**

  /event/

* **Method:**

  `POST`

*  **URL Params**

-

* **Data Params**
    **Required:**

    `description=[string]`
    `startTime=[ISO 8601 string]`
    `endTime=[ISO 8601 string]`


    **Optional:**

    `location=[string]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
                                        "description": "Sample description6",
                                        "location": "Espoo3",
                                        "startTime": "2015-02-08 09:30",
                                        "endTime": "2015-02-08 10:30",
                                        "_id": "5613c934b03343196a0b1893"
                                    }`


* **Error Response:**
  * **Code:** 400 Bad Request <br />
    **Content:** `{
                      "description": [
                          "Description can't be blank"
                      ]
                  }`

 * **Code:** 400 Bad Request <br />
     **Content:** `{
                       "startTime": [
                           "Start time 2015-02-08 09:30 must be smaller than 2015-02-08 08:30"
                       ]
                   }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/event/",
      dataType: "json",
      type : "POST",
      data: JSON.stringify({
                                                                   "description": "Sample description6",
                                                                   "location": "Espoo3",
                                                                   "startTime": "2015-02-08 09:30",
                                                                   "endTime": "2015-02-08 10:30"
                                                               })
      success : function(r) {
        console.log(r);
      }
    });
  ```
**Edit Event**
----
Edit certain event. You can only update certain attribute in the event without needing to send all attributes when updating event.

* **URL:**

    /event/:id

* **Method:**

    `PUT`

*  **URL Params**
     **Required:**
        `id=[string]`

* **Data Params**
    **Optional:**
     `description=[string]`
     `location=[string]`
     `startTime=[ISO 8601 string]`
     `endTime=[ISO 8601 string]`
     `attendees=[array[email]]`



* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
                                        "description": "Sample description6",
                                        "location": "Espoo3",
                                        "startTime": "2015-02-08 09:30",
                                        "endTime": "2015-02-08 10:30",
                                        "_id": "5613c934b03343196a0b1893"
                                    }`


* **Error Response:**
  * **Code:** 404 NOT FOUND <br />
      **Content:**

OR

 * **Code:** 400 Bad Request <br />
     **Content:** `{
                       "startTime": [
                           "Start time 2015-02-08 09:30 must be smaller than 2015-02-08 08:30"
                       ]
                   }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/event/5613c934b03343196a0b1893",
      dataType: "json",
      type : "PUT",
      data: JSON.stringify({"endTime": "2015-02-08 11:30"})
      success : function(r) {
        console.log(r);
      }
    });
  ```










