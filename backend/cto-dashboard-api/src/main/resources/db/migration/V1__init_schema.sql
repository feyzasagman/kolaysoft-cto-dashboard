-- Kolaysoft CTO Dashboard — V1 initial schema
-- Source of truth: JPA entity model (not database/schema.sql reference dump).
-- Enums are stored as VARCHAR (EnumType.STRING).
-- No secondary indexes beyond unique constraints declared on entities.

CREATE TABLE roles (
    role_id     BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uk_roles_name UNIQUE (name)
);

CREATE TABLE users (
    user_id       BIGSERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN      NOT NULL,
    created_at    TIMESTAMP    NOT NULL,
    role_id       BIGINT       NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
);

CREATE TABLE projects (
    project_id  BIGSERIAL PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL,
    name        VARCHAR(200) NOT NULL,
    customer    VARCHAR(200),
    description TEXT,
    status      VARCHAR(30)  NOT NULL,
    manager_id  BIGINT,
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMP    NOT NULL,
    CONSTRAINT uk_projects_code UNIQUE (code),
    CONSTRAINT fk_projects_manager
        FOREIGN KEY (manager_id) REFERENCES users (user_id)
);

CREATE TABLE project_assignments (
    assignment_id   BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       NOT NULL,
    user_id         BIGINT       NOT NULL,
    assignment_role VARCHAR(50)  NOT NULL,
    assigned_at     TIMESTAMP    NOT NULL,
    CONSTRAINT fk_project_assignments_project
        FOREIGN KEY (project_id) REFERENCES projects (project_id),
    CONSTRAINT fk_project_assignments_user
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT uk_project_assignments_project_user
        UNIQUE (project_id, user_id)
);

CREATE TABLE weekly_reports (
    report_id        BIGSERIAL PRIMARY KEY,
    project_id       BIGINT  NOT NULL,
    year             INTEGER NOT NULL,
    week_number      INTEGER NOT NULL,
    report_date      DATE    NOT NULL,
    planned_progress INTEGER,
    actual_progress  INTEGER,
    project_status   VARCHAR(50),
    schedule_status  VARCHAR(50),
    live_task_count  INTEGER,
    completed_work   TEXT,
    planned_work     TEXT,
    overall_note     TEXT,
    CONSTRAINT fk_weekly_reports_project
        FOREIGN KEY (project_id) REFERENCES projects (project_id),
    CONSTRAINT uk_weekly_reports_project_year_week
        UNIQUE (project_id, year, week_number)
);

CREATE TABLE work_items (
    work_item_id   BIGSERIAL PRIMARY KEY,
    report_id      BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    assignee       VARCHAR(150),
    status         VARCHAR(30)  NOT NULL,
    planned_date   DATE,
    completed_date DATE,
    note           TEXT,
    CONSTRAINT fk_work_items_weekly_report
        FOREIGN KEY (report_id) REFERENCES weekly_reports (report_id)
);

CREATE TABLE risk_issues (
    risk_id     BIGSERIAL PRIMARY KEY,
    report_id   BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level  VARCHAR(20)  NOT NULL,
    impact      TEXT,
    action_plan TEXT,
    status      VARCHAR(30)  NOT NULL,
    CONSTRAINT fk_risk_issues_weekly_report
        FOREIGN KEY (report_id) REFERENCES weekly_reports (report_id)
);
