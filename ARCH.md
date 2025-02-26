# Routes:


- User data structure
```cpp
typedef struct User{
    string name;
    string email;
    string password;
    
} User;
``` 

- Chat data structure
```cpp
typedef struct Chat{
    Message* messages;
}
```

- Message data structure
```cpp
typedef struct Message{
    string content;
    string sent_by;
    User* belongs_to;
    time_t sent_at;
}
```
## API Routes
    - GET /api/user/
    - /
