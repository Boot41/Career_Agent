class OrganizationRouter:
    """
    Database router for multi-tenant organization setup.
    Routes authentication models to default DB and organization-specific models to their respective DBs.
    """
    
    def db_for_read(self, model, **hints):
        """
        Route read operations to appropriate database
        """
        if model._meta.app_label == 'authentication':
            return 'default'
        elif model._meta.app_label in ['organizations', 'feedback']:
            # Get organization ID from context and return appropriate DB
            from django.conf import settings
            org_id = getattr(settings, 'CURRENT_ORG_ID', None)
            if org_id:
                return f'org_{org_id}'
        return None

    def db_for_write(self, model, **hints):
        """
        Route write operations to appropriate database
        """
        if model._meta.app_label == 'authentication':
            return 'default'
        elif model._meta.app_label in ['organizations', 'feedback']:
            # Get organization ID from context and return appropriate DB
            from django.conf import settings
            org_id = getattr(settings, 'CURRENT_ORG_ID', None)
            if org_id:
                return f'org_{org_id}'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both objects are in the same database
        """
        if obj1._meta.app_label == obj2._meta.app_label:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Control which apps can migrate in which database
        """
        if app_label == 'authentication':
            return db == 'default'
        elif app_label in ['organizations', 'feedback']:
            return db.startswith('org_')
        return None
