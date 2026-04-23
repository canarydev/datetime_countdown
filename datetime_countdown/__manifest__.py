{
    "name": "Datetime Countdown Widget",
    "summary": "Human-friendly datetime countdown field widget",
    "version": "18.0.1.0.0",
    "category": "Tools",
    "license": "LGPL-3",
    "author": "canarydev",
    "website": "https://canarydev.es",
    "depends": ["web"],
    'images': ['static/description/banner.png'],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "datetime_countdown_widget/static/src/widgets/datetime_countdown/datetime_countdown.js",
            "datetime_countdown_widget/static/src/widgets/datetime_countdown/datetime_countdown.xml",
            "datetime_countdown_widget/static/src/widgets/datetime_countdown/datetime_countdown.scss",
        ],
    },
    "installable": True,
    "application": False,
}
