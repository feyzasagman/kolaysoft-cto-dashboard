# Pull Request

## Summary

Bu PR ne değiştiriyor?

## Type of Change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Test
- [ ] Documentation
- [ ] CI / Build / Infrastructure
- [ ] Dependency update

## Scope

Etkilenen alanlar:

- [ ] Backend
- [ ] Frontend
- [ ] Database / Flyway
- [ ] Docker / Deployment
- [ ] CI
- [ ] Documentation

## Validation

Çalıştırılan kontroller (yerel). **GitHub Actions CI Quality Gate** otomatik doğrulamanın kaynağıdır; checkbox CI yerine geçmez.

- [ ] Backend tests (`./mvnw.cmd test` veya `clean verify`)
- [ ] Frontend unit/component tests (`npm run test:run` veya `test:coverage`)
- [ ] Frontend lint (`npm run lint`)
- [ ] Frontend build (`npm run build`)
- [ ] Playwright E2E (`npm run test:e2e`)
- [ ] Docker smoke test
- [ ] Not applicable

## Security / Data

- [ ] Secret veya credential commit edilmedi (`.env`, JWT, DB password vb.)
- [ ] Authorization / RBAC etkisi değerlendirildi
- [ ] Schema değişikliği varsa **yeni Flyway migration** eklendi (mevcut migration’ı rewrite etme)
- [ ] Demo/test data gerçek kişisel veri içermiyor
- [ ] Not applicable

## Screenshots

UI değişikliği varsa before/after veya final screenshot ekleyin.

## Breaking Changes

Var mı? Varsa API, şema, env veya Docker davranışını açıkça yazın.

## Related Issue

Closes #
