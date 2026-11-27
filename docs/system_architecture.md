# System Architecture & Flows - CivicConnect

This document details the system design, ER diagrams, and logical flowcharts governing CivicConnect.

---

## 1. System Architecture

CivicConnect follows a standard, decoupled modern application architecture:

```mermaid
graph TD
    User([Browser Client / Mobile])
    
    subgraph Frontend [React Application - Port 80]
        UI[Tailwind UI & Pages]
        Context[AppContext State Provider]
        Leaflet[Leaflet Map / Google Map]
    end
    
    subgraph Backend [Express API - Port 5000]
        Router[API Route Maps]
        Controller[Controllers & Logic]
        Auth[JWT & Bcrypt Middleware]
    end

    subgraph Database [Postgres Database - Port 5432]
        Tables[Tables & Indexes]
        PostGIS[PostGIS Geospatial Engine]
    end

    User <-->|HTTP / JSON| UI
    UI <--> Context
    Context <--> Leaflet
    UI <-->|Axios Requests| Router
    Router <--> Controller
    Controller <--> Auth
    Controller <-->|Geospatial Queries| Tables
    Tables <--> PostGIS
```

---

## 2. Database Schema (ER Diagram)

The relational schema maps citizen profiles, bookmarks, local emergency contacts, and departments. GIST indexes accelerate coordinates distance checks.

```mermaid
erDiagram
    users {
        int id PK
        string name
        string phone
        string email UK
        string password
        timestamp created_at
    }
    departments {
        int id PK
        string department_name
        string office_name
        string officer_name
        string designation
        string phone
        string emergency_phone
        string email
        string website
        double latitude
        double longitude
        geography location "PostGIS Geography Point"
        string address
        string city
        string district
        string state
        string country
        string working_hours
        string status
    }
    complaint_categories {
        int id PK
        string category_name UK
        string department_name
        string icon
        string description
    }
    emergency_contacts {
        int id PK
        string department
        string phone
        string city
        string state
      }
    bookmarks {
        int id PK
        int user_id FK
        int department_id FK
        timestamp created_at
    }

    users ||--o{ bookmarks : "saves"
    departments ||--o{ bookmarks : "bookmarked_by"
```

---

## 3. Application Flowchart

This flowchart maps the citizen's journey from location resolution through to spatial results and calling.

```mermaid
graph TD
    Start([Launch App]) --> CheckLoc{Location Set?}
    
    CheckLoc -->|Yes| ShowCats[Display Complaint Categories Grid]
    CheckLoc -->|No| RequestGPS[Request Browser Geolocation]
    
    RequestGPS -->|Granted| Geocode[Fetch /api/location for reverse geocode]
    Geocode --> SaveLoc[Save Coords & City in Context]
    SaveLoc --> ShowCats
    
    RequestGPS -->|Denied| ManualInput[Render Manual Selection Form]
    ManualInput --> SubmitManual[Resolve City Presets / Delhi Default]
    SubmitManual --> SaveLoc
    
    ShowCats --> SelectCat[User Selects a Complaint Category]
    SelectCat --> QueryNearest[GET /api/departments/nearest]
    
    QueryNearest --> PostGISCheck[PostGIS KNN Distance Sort <->]
    PostGISCheck --> ShowResults[Render Results List & Routing Map]
    
    ShowResults --> Action{User Interaction}
    Action -->|One-Click Call| Dial[Trigger tel:phone]
    Action -->|Direction| Nav[Open Google Maps Driving Directions]
    Action -->|Bookmark| Save[Save to Bookmarks Table - Auth Required]
```
