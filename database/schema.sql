-- Kolaysoft CTO Dashboard
-- Day 6: Hibernate entity modelinden türetilen PostgreSQL şeması
-- Not: Geliştirme ortamında şema ayrıca olarak Hibernate ddl-auto=update ile de oluşturulabilir.

CREATE TABLE IF NOT EXISTS roles (
    role_id      BIGSERIAL PRIMARY KEY,
    name         VARCHAR(50)  NOT NULL UNIQUE,
    description  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    user_id       BIGSERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL,
    role_id       BIGINT       NOT NULL,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
);

CREATE TABLE IF NOT EXISTS projects (
    project_id  BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    customer    VARCHAR(200),
    description TEXT,
    status      VARCHAR(30)  NOT NULL,
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS project_assignments (
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

CREATE TABLE IF NOT EXISTS weekly_reports (
    report_id         BIGSERIAL PRIMARY KEY,
    project_id        BIGINT  NOT NULL,
    year              INTEGER NOT NULL,
    week_number       INTEGER NOT NULL,
    report_date       DATE    NOT NULL,
    planned_progress  INTEGER,
    actual_progress   INTEGER,
    project_status    VARCHAR(50),
    schedule_status   VARCHAR(50),
    live_task_count   INTEGER,
    completed_work    TEXT,
    planned_work      TEXT,
    overall_note      TEXT,
    CONSTRAINT fk_weekly_reports_project
        FOREIGN KEY (project_id) REFERENCES projects (project_id),
    CONSTRAINT uk_weekly_reports_project_year_week
        UNIQUE (project_id, year, week_number)
);

CREATE TABLE IF NOT EXISTS work_items (
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

CREATE TABLE IF NOT EXISTS risk_issues (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user_id ON project_assignments (user_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments (project_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_project_id ON weekly_reports (project_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_year_week ON weekly_reports (year, week_number);
CREATE INDEX IF NOT EXISTS idx_work_items_report_id ON work_items (report_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items (status);
CREATE INDEX IF NOT EXISTS idx_risk_issues_report_id ON risk_issues (report_id);
CREATE INDEX IF NOT EXISTS idx_risk_issues_risk_level ON risk_issues (risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_issues_status ON risk_issues (status);
